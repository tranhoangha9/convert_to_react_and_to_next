'use client';
import React, { Component } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import '../admin.css';
import './orders.css';

class AdminOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      loading: true,
      currentPage: 1,
      totalPages: 1,
      searchTerm: '',
      statusFilter: 'all'
    };
  }

  async componentDidMount() {
    this.fetchOrders();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (
      prevState.currentPage !== this.state.currentPage ||
      prevState.searchTerm !== this.state.searchTerm ||
      prevState.statusFilter !== this.state.statusFilter
    ) {
      this.fetchOrders();
    }
  }

  fetchOrders = async () => {
    try {
      this.setState({ loading: true });
      const response = await fetch(`/api/admin/orders?page=${this.state.currentPage}&search=${this.state.searchTerm}&status=${this.state.statusFilter}`);
      const data = await response.json();

      if (data.success) {
        this.setState({
          orders: data.orders,
          totalPages: data.totalPages,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Lỗi khi tải danh sách đơn hàng');
      this.setState({ loading: false });
    }
  };

  handleSearchChange = (e) => {
    this.setState({
      searchTerm: e.target.value,
      currentPage: 1
    });
  };

  handleStatusFilterChange = (e) => {
    this.setState({
      statusFilter: e.target.value,
      currentPage: 1
    });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  getStatusBadgeClass = (status) => {
    switch(status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'shipped': return 'status-shipped';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  render() {
    const { orders, loading, currentPage, totalPages, searchTerm, statusFilter } = this.state;

    if (loading) {
      return (
        <div className="admin-container">
          <AdminSidebar currentPath="/admin/orders" />
          <div className="admin-content">
            <div className="loading-spinner">Loading orders...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-container">
        <AdminSidebar currentPath="/admin/orders" />
        <div className="admin-content">
          <div className="orders-controls">
            <div className="orders-search-box">
              <input
                type="text"
                placeholder="Search by order ID, customer name or email..."
                value={searchTerm}
                onChange={this.handleSearchChange}
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>

            <div className="filters">
              <select value={statusFilter} onChange={this.handleStatusFilterChange}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="shipped">Shipped</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="admin-card">
            <h3>Orders Management</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-orders-message">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td className="order-id">{order.id}</td>
                      <td className="customer-name">{order.customer}</td>
                      <td className="customer-email">{order.email}</td>
                      <td className="order-amount">${order.amount}</td>
                      <td>
                        <span className={`status-badge ${this.getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="order-date">{order.date}</td>
                      <td className="order-items">{order.items}</td>
                      <td className="payment-method">{order.paymentMethod}</td>
                      <td className="order-actions">
                        <button className="btn-small btn-view">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-info">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="pagination-controls">
              <button
                className="btn-pagination"
                disabled={currentPage === 1}
                onClick={() => this.handlePageChange(currentPage - 1)}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`btn-pagination ${currentPage === page ? 'active' : ''}`}
                  onClick={() => this.handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="btn-pagination"
                disabled={currentPage === totalPages}
                onClick={() => this.handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminOrders;
