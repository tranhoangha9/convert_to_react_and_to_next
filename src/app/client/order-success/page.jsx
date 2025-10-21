'use client';
import React, { Component } from 'react';
import Link from 'next/link';

class OrderSuccess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order: null,
      loading: true
    };
  }

  async componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (orderId) {
      await this.loadOrderDetails(orderId);
    } else {
      this.setState({ loading: false });
    }
  }

  loadOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/client/orders/[id]?orderId=${orderId}`);
      const data = await response.json();

      if (data.success) {
        this.setState({ order: data.order, loading: false });
      } else {
        this.setState({ loading: false });
      }
    } catch (error) {
      console.error('Error loading order:', error);
      this.setState({ loading: false });
    }
  }

  render() {
    const { order, loading } = this.state;

    if (loading) {
      return (
        <div className="order-success-container">
          <div className="loading">Đang tải thông tin đơn hàng...</div>
        </div>
      );
    }

    if (!order) {
      return (
        <div className="order-success-container">
          <div className="error">
            <h2>Không tìm thấy đơn hàng</h2>
            <Link href="/client/account" className="btn-primary">Về tài khoản</Link>
          </div>
        </div>
      );
    }

    return (
      <div className="order-success-container">
        <div className="success-content">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="#48bb78"/>
              <path d="M26 40l8 8 16-16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1>Đặt hàng thành công!</h1>
          <p>Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi.</p>

          <div className="order-info">
            <h3>Thông tin đơn hàng</h3>
            <div className="info-row">
              <span>Mã đơn hàng:</span>
              <span>#{order.id}</span>
            </div>
            <div className="info-row">
              <span>Tổng tiền:</span>
              <span>${order.totalAmount}</span>
            </div>
            {order.discount && (
              <div className="info-row">
                <span>Giảm giá đã áp dụng:</span>
                <div className="discount-info">
                  <span className="discount-applied">{order.discount.name}</span>
                  <span className="discount-code">({order.discount.code})</span>
                </div>
              </div>
            )}
            <div className="info-row">
              <span>Phương thức thanh toán:</span>
              <span>{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thẻ tín dụng'}</span>
            </div>
            <div className="info-row">
              <span>Trạng thái đơn hàng:</span>
              <span className="status pending">Đang xử lý</span>
            </div>
          </div>

          <div className="order-actions">
            <Link href="/client/account" className="btn-primary">Xem đơn hàng</Link>
            <Link href="/" className="btn-secondary">Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default OrderSuccess;
