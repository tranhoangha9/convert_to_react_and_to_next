'use client';
import React, { Component } from 'react';
import Link from 'next/link';
import './checkout.css';

class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: [],
      showInformation: false,
      showPayment: false,
      discount: 0,
      discountCode: null,
      discountId: null,

      information: {
        fullName: '',
        countryCode: '+84',
        mobileNumber: '',
        state: '',
        city: '',
        pinCode: ''
      },

      payment: {
        method: 'cod',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
      },

      loading: false,
      currentStep: 'cart'
    };
  }

  async componentDidMount() {
    await this.loadCartItems();
    await this.checkUserLogin();

    if (typeof window !== 'undefined') {
      const savedDiscount = sessionStorage.getItem('cartDiscount');
      const savedDiscountCode = sessionStorage.getItem('cartDiscountCode');
      const savedDiscountId = sessionStorage.getItem('cartDiscountId');
      this.setState({
        discount: savedDiscount ? parseFloat(savedDiscount) : 0,
        discountCode: savedDiscountCode || null,
        discountId: savedDiscountId ? parseInt(savedDiscountId, 10) : null
      });
    }
  }

  loadCartItems = async () => {
    try {
      const { getCart } = await import('@/lib/cartService');
      const cartItems = await getCart();
      this.setState({ cartItems });
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }

  checkUserLogin = async () => {
    try {
      const { getCurrentUser } = await import('@/lib/authService');
      const user = getCurrentUser();

      if (!user || !user.id) {
        window.location.href = '/client/auth/login?redirect=/client/checkout';
        return;
      }

      this.setState({
        information: {
          fullName: user.name || '',
          countryCode: '+84',
          mobileNumber: user.phone || '',
          state: '',
          city: '',
          pinCode: ''
        }
      });
    } catch (error) {
      console.error('Error checking user login:', error);
    }
  }

  handleInformationChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      information: {
        ...prevState.information,
        [name]: value
      }
    }));
  }

  handlePaymentChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      payment: {
        ...prevState.payment,
        [name]: value
      }
    }));
  }

  handleContinueToPayment = () => {
    const { information } = this.state;

    if (!information.fullName || !information.mobileNumber || !information.state || !information.city) {
      alert('Please fill in all required fields');
      return;
    }

    this.setState({ showInformation: false, showPayment: true });
  }

  handleBackToInformation = () => {
    this.setState({ showInformation: true, showPayment: false });
  }

  handlePlaceOrder = async () => {
    const { information, payment, cartItems, discount, discountCode, discountId } = this.state;

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!information.fullName || !information.mobileNumber || !information.state || !information.city) {
      alert('Please complete all shipping information');
      this.setState({ showInformation: true, showPayment: false });
      return;
    }

    if (payment.method === 'card') {
      if (!payment.cardNumber || !payment.expiryDate || !payment.cvv || !payment.cardHolderName) {
        alert('Please complete all card details');
        this.setState({ showInformation: false, showPayment: true });
        return;
      }
    }

    this.setState({ loading: true });

    try {
      const { getCurrentUser } = await import('@/lib/authService');
      const user = getCurrentUser();

      if (discount > 0 && (!discountCode || !discountId)) {
        alert('Applied discount could not be found. Please try applying it again.');
        return;
      }

      const orderData = {
        userId: user.id,
        customerInfo: information,
        paymentInfo: payment,
        cartItems: cartItems,
        total: this.calculateTotal(),
        discount: discount || 0,
        discountCode: discount > 0 ? discountCode : null,
        discountId: discount > 0 ? discountId : null
      };

      const response = await fetch('/api/client/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        const { clearCart } = await import('@/lib/cartService');
        await clearCart();

        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('cartDiscount');
          sessionStorage.removeItem('cartDiscountCode');
          sessionStorage.removeItem('cartDiscountId');
        }

        alert('Order placed successfully!');
        window.location.href = `/client/order-success?orderId=${data.orderId}`;
      } else {
        alert(data.error || 'An error occurred while placing the order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing the order');
    } finally {
      this.setState({ loading: false });
    }
  }

  calculateTotal = () => {
    const { cartItems, discount } = this.state;
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 200 ? 0 : 10;
    return subtotal + shipping - discount;
  }

  render() {
    const { cartItems, discount, loading } = this.state;

    if (cartItems.length === 0) {
      return (
        <div className="checkout-container">
          <div className="checkout-empty">
            <h2>Your cart is empty</h2>
            <p>Please add items to your cart before proceeding to checkout</p>
            <Link href="/" className="btn-continue-shopping">Continue shopping</Link>
          </div>
        </div>
      );
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 200 ? 0 : 10;
    const discountAmount = discount || 0;
    const total = subtotal + shipping - discountAmount;

    return (
      <>
        <section className="checkout-breadcrumbs">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">&gt;</span>
          <Link href="/client/cart">Cart</Link>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-current">Checkout</span>
        </section>

        <section className="checkout-header">
          <div className="checkout-title">
            <h1>Checkout</h1>
          </div>
        </section>

        <section className="checkout-main-layout">
          <div className="checkout-content-section">
            <div className="checkout-forms">
              <div className="checkout-form-section">
                <div className="checkout-section-header">
                  <input
                    type="checkbox"
                    className="checkout-section-toggle"
                    id="information-toggle"
                    checked={this.state.showInformation}
                    onChange={() => this.setState(prev => ({ showInformation: !prev.showInformation }))}
                  />
                  <label htmlFor="information-toggle" className="checkout-section-title">
                    Customer Information
                    <svg className="checkout-dropdown-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_2013_3045)">
                        <path d="M4.5 15L12 7.5L19.5 15" stroke="currentColor" />
                      </g>
                      <defs>
                        <clipPath id="clip0_2013_3045">
                          <rect width="24" height="24" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </label>
                </div>

                {this.state.showInformation && (
                  <div className="checkout-section-content">
                    <form className="checkout-information-form">
                      <div className="checkout-form-row">
                        <div className="checkout-form-group">
                          <label>Full Name *</label>
                          <input
                            type="text"
                            name="fullName"
                            value={this.state.information.fullName}
                            onChange={this.handleInformationChange}
                            placeholder="Enter full name"
                            required
                          />
                        </div>
                        <div className="checkout-mobile-group">
                          <label>Mobile Number *</label>
                          <div className="checkout-mobile-input">
                            <input
                              type="text"
                              name="countryCode"
                              value={this.state.information.countryCode}
                              onChange={this.handleInformationChange}
                              className="checkout-country-code-simple"
                              maxLength="4"
                              placeholder="+84"
                            />
                            <input
                              type="tel"
                              name="mobileNumber"
                              value={this.state.information.mobileNumber}
                              onChange={this.handleInformationChange}
                              placeholder="Enter mobile number"
                              className="checkout-mobile-number"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="checkout-form-row">
                        <div className="checkout-form-group">
                          <label>State *</label>
                          <input
                            type="text"
                            name="state"
                            value={this.state.information.state}
                            onChange={this.handleInformationChange}
                            placeholder="Enter state"
                            required
                          />
                        </div>
                        <div className="checkout-form-group">
                          <label>City *</label>
                          <input
                            type="text"
                            name="city"
                            value={this.state.information.city}
                            onChange={this.handleInformationChange}
                            placeholder="Enter city"
                            required
                          />
                        </div>
                      </div>

                      <div className="checkout-form-group">
                        <label>Pin Code</label>
                        <input
                          type="text"
                          name="pinCode"
                          value={this.state.information.pinCode}
                          onChange={this.handleInformationChange}
                          placeholder="Enter pin code"
                        />
                      </div>

                      <div className="checkout-form-actions">
                        <button
                          type="button"
                          className="checkout-btn-next"
                          onClick={this.handleContinueToPayment}
                        >
                          Next
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <div className="checkout-form-section">
                <div className="checkout-section-header">
                  <input
                    type="checkbox"
                    className="checkout-section-toggle"
                    id="payment-toggle"
                    checked={this.state.showPayment}
                    onChange={() => this.setState(prev => ({ showPayment: !prev.showPayment }))}
                  />
                  <label htmlFor="payment-toggle" className="checkout-section-title">
                    Payment Information
                    <svg className="checkout-dropdown-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_2013_3045)">
                        <path d="M4.5 15L12 7.5L19.5 15" stroke="currentColor" />
                      </g>
                      <defs>
                        <clipPath id="clip0_2013_3045">
                          <rect width="24" height="24" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </label>
                </div>

                {this.state.showPayment && (
                  <div className="checkout-section-content">
                    <div className="checkout-payment-methods">
                      <div className="checkout-payment-method">
                        <input
                          type="radio"
                          id="cod"
                          name="method"
                          value="cod"
                          checked={this.state.payment.method === 'cod'}
                          onChange={this.handlePaymentChange}
                        />
                        <label htmlFor="cod">Cash on Delivery (COD)</label>
                      </div>

                      <div className="checkout-payment-method">
                        <input
                          type="radio"
                          id="card"
                          name="method"
                          value="card"
                          checked={this.state.payment.method === 'card'}
                          onChange={this.handlePaymentChange}
                        />
                        <label htmlFor="card">Credit/Debit Card</label>
                      </div>
                    </div>

                    {this.state.payment.method === 'card' && (
                      <form className="checkout-payment-form">
                        <div className="checkout-form-group">
                          <label>Card Number *</label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={this.state.payment.cardNumber}
                            onChange={this.handlePaymentChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            required
                          />
                        </div>

                        <div className="checkout-form-row">
                          <div className="checkout-form-group">
                            <label>Expiry Date *</label>
                            <input
                              type="text"
                              name="expiryDate"
                              value={this.state.payment.expiryDate}
                              onChange={this.handlePaymentChange}
                              placeholder="MM/YY"
                              maxLength="5"
                              required
                            />
                          </div>
                          <div className="checkout-form-group">
                            <label>CVV *</label>
                            <input
                              type="text"
                              name="cvv"
                              value={this.state.payment.cvv}
                              onChange={this.handlePaymentChange}
                              placeholder="123"
                              maxLength="4"
                              required
                            />
                          </div>
                        </div>

                        <div className="checkout-form-group">
                          <label>Cardholder Name *</label>
                          <input
                            type="text"
                            name="cardHolderName"
                            value={this.state.payment.cardHolderName}
                            onChange={this.handlePaymentChange}
                            placeholder="Enter cardholder name"
                            required
                          />
                        </div>
                      </form>
                    )}

                    <div className="checkout-form-actions">
                      <button
                        type="button"
                        className="checkout-btn-back"
                        onClick={this.handleBackToInformation}
                      >
                        Back to Information
                      </button>
                      <button
                        type="button"
                        className="checkout-btn-place-order"
                        onClick={this.handlePlaceOrder}
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Place Order'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="checkout-summary-section">
            <div className="checkout-order-summary-box">
              <div className="checkout-summary-title">Order Summary</div>

              <div className="checkout-cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="checkout-cart-item">
                    <img src={item.image} alt={item.name} className="checkout-item-image" />
                    <div className="checkout-item-info">
                      <h4 className="checkout-item-name">{item.name}</h4>
                      <p className="checkout-item-brand">{item.brand}</p>
                      <p className="checkout-item-quantity">Qty: {item.quantity}</p>
                    </div>
                    <div className="checkout-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-item">
                <span className="checkout-summary-label">Subtotal ({cartItems.length} items)</span>
                <span className="checkout-summary-value">${subtotal.toFixed(2)}</span>
              </div>

              <div className="checkout-summary-item">
                <span className="checkout-summary-label">Discount</span>
                <span className="checkout-discount-value">${discountAmount.toFixed(2)}</span>
              </div>

              <div className="checkout-summary-item">
                <span className="checkout-summary-label">Delivery Fee</span>
                <span className="checkout-delivery-value">${shipping.toFixed(2)}</span>
              </div>

              <div className="checkout-grand-total">
                <span className="checkout-grand-total-label">Grand Total</span>
                <span className="checkout-grand-total-amount">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
}

export default Checkout;
