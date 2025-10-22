"use client";
import React, { Component } from "react";
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
    this.loadCartItems();
    this.checkCartInterval = setInterval(() => {
      this.loadCartItems();
    }, 1000);
  }

  componentWillUnmount() {
    if (this.checkCartInterval) {
      clearInterval(this.checkCartInterval);
    }
  }

  loadCartItems = () => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      const newItems = JSON.parse(savedCart);
      if (JSON.stringify(this.state.items) !== JSON.stringify(newItems)) {
        this.setState({ items: newItems });
      }
    }
  };

  updateQuantity = (id, change) => {
    this.setState((prevState) => {
      const updatedItems = prevState.items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
      const event = new Event("storage");
      event.key = "cartItems";
      window.dispatchEvent(event);
      return { items: updatedItems };
    });
  };

  removeItem = (id) => {
    this.setState((prevState) => {
      const updatedItems = prevState.items.filter((item) => item.id !== id);
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
      return { items: updatedItems };
    });
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
