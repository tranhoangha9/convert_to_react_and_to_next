"use client";
import React, { Component } from "react";
import { getCurrentUser } from "@/lib/authService";
import { getCart } from "@/lib/cartService";
import "./CartModal.css";
import Link from "next/link";

class CartModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      couponCode: "",
      tax: 2.0,
    };
    this.checkCartInterval = null;
  }

  componentDidMount() {
    this.refreshCart();

    this.checkCartInterval = setInterval(() => {
      this.refreshCart(true);
    }, 1500);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.refreshCart();
    }
  }

  componentWillUnmount() {
    if (this.checkCartInterval) {
      clearInterval(this.checkCartInterval);
    }
  }

  refreshCart = async (isPolling = false) => {
    const user = getCurrentUser();
    if (user && user.id) {
      const items = await getCart();
      this.setState({ items });
      return;
    }

    if (!isPolling && !this.props.isOpen) return;

    const savedCart = localStorage.getItem("cartItems");
    const newItems = savedCart ? JSON.parse(savedCart) : [];

    if (JSON.stringify(this.state.items) !== JSON.stringify(newItems)) {
      this.setState({ items: newItems });
    }
  };

  updateQuantity = async (id, change) => {
    const targetItem = this.state.items.find(item => item.id === id);
    if (!targetItem) return;

    const newQuantity = Math.max(1, targetItem.quantity + change);

    this.setState((prevState) => ({
      items: prevState.items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    }));

    try {
      const { updateCartItemQuantity } = await import('@/lib/cartService');
      await updateCartItemQuantity(id, newQuantity);
      await this.refreshCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  removeItem = async (id) => {
    this.setState((prevState) => ({
      items: prevState.items.filter(item => item.id !== id)
    }));

    try {
      const { removeFromCart } = await import('@/lib/cartService');
      await removeFromCart(id);
      await this.refreshCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  getSubtotal = () => {
    return this.state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  handleCouponSubmit = (e) => {
    e.preventDefault();
  };

  render() {
    const { isOpen, onClose } = this.props;
    const subtotal = this.getSubtotal();
    const total = subtotal + this.state.tax;

    if (!isOpen) return null;

    return (
      <div
        className="cart-modal-overlay"
        onClick={(e) => {
          if (e.target.className === "cart-modal-overlay") {
            onClose();
          }
        }}
      >
        <div className="cart-modal">
          <div className="cart-modal-header">
            <button
              onClick={onClose}
              className="back-button"
              aria-label="Close cart modal"
            >
              ← Back
            </button>
          </div>

          <div className="cart-items">
            {this.state.items.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <div className="item-details-bottom">
                    <div className="quantity-controls">
                      <button
                        onClick={() => this.updateQuantity(item.id, -1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => this.updateQuantity(item.id, 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <div className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => this.removeItem(item.id)}
                  className="remove-item"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>${this.state.tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <form
              onSubmit={this.handleCouponSubmit}
              className="modal-coupon-form"
            >
              <input
                type="text"
                placeholder="Apply Coupon Code"
                value={this.state.couponCode}
                onChange={(e) => this.setState({ couponCode: e.target.value })}
              />
              <button type="submit" aria-label="Apply coupon code">
                Apply
              </button>
            </form>

            <div className="cart-actions">
              <Link
                href="/client/cart"
                onClick={onClose}
                className="place-order-btn"
                aria-label="Proceed to checkout"
              >
                Place Order
              </Link>
              <button
                onClick={onClose}
                className="continue-shopping-btn"
                aria-label="Continue shopping"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CartModal;
