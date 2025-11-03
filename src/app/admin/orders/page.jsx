'use client';
import React, { Component } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AuthGuard from '../components/AuthGuard';
import '../styles/admin.css';
import './orders.css';

class AdminOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      loading: true,
      currentPage: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      searchTerm: '',
      statusFilter: 'all',
      sortOrder: 'desc',
      isRefreshing: false
    };
    this.searchTimeout = null;
  }

  async componentDidMount() {
    this.fetchOrders();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (
      prevState.currentPage !== this.state.currentPage ||
      prevState.statusFilter !== this.state.statusFilter ||
      prevState.sortOrder !== this.state.sortOrder
    ) {
      this.fetchOrders();
    }
  }

  fetchOrders = async (fromSearch = false) => {
    try {
      if (!fromSearch) {
        if (this.state.orders.length === 0) {
          this.setState({ loading: true, isRefreshing: false });
        } else {
          this.setState({ isRefreshing: true });
        }
      }
      const params = new URLSearchParams({
        page: this.state.currentPage.toString(),
        limit: '8',
        search: this.state.searchTerm,
        status: this.state.statusFilter,
        sort: this.state.sortOrder
      });
      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        const pagination = data.pagination || {};
        const totalPages = Math.max(1, pagination.totalPages || 1);
        const normalizedPage = Math.min(this.state.currentPage, totalPages);
        this.setState({
          orders: data.orders,
          totalPages,
          currentPage: normalizedPage,
          hasNext: pagination.hasNext ?? (normalizedPage < totalPages),
          hasPrev: pagination.hasPrev ?? (normalizedPage > 1),
          loading: false,
          isRefreshing: false
        });
      } else {
        this.setState({ loading: false, isRefreshing: false });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error loading orders');
      this.setState({ loading: false, isRefreshing: false });
    }
  };

  handleStatusFilterChange = (e) => {
    this.setState({
      statusFilter: e.target.value,
      currentPage: 1
    });
  };

  toggleSortOrder = () => {
    this.setState(prevState => ({
      sortOrder: prevState.sortOrder === 'desc' ? 'asc' : 'desc',
      currentPage: 1
    }));
  };

  handlePageChange = (page) => {
    this.setState((prevState) => {
      const nextPage = Math.min(Math.max(page, 1), prevState.totalPages);
      if (nextPage === prevState.currentPage){
        return null;
      }
      return { currentPage: nextPage };
    });
  };

  handleSearchChange = (e) => {
    const value = e.target.value;
    this.setState({ searchTerm: value });

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.setState({ currentPage: 1 }, () => {
        this.fetchOrders(true);
      });
    }, 500);
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
    const {
      orders,
      loading,
      currentPage,
      totalPages,
      searchTerm,
      statusFilter,
      hasNext,
      hasPrev,
      sortOrder,
      isRefreshing
    } = this.state;

    if (loading) {
      return (
        <AuthGuard>
          <div className="admin-container">
            <AdminSidebar currentPath="/admin/orders" />
            <div className="admin-content">
              <div className="loading-spinner">Loading orders...</div>
            </div>
          </div>
        </AuthGuard>
      );
    }

    return (
      <AuthGuard>
        <div className="admin-container">
          <AdminSidebar currentPath="/admin/orders" />
        <div className="admin-content orders-page">
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
            <table className="admin-table" aria-busy={isRefreshing}>
              <thead>
                <tr>
                  <th
                    className="sortable-header"
                    onClick={this.toggleSortOrder}
                    role="button"
                    aria-label={`Sort by Order ID ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
                  >
                    Order ID
                  </th>
                  <th className="text-left">Customer</th>
                  <th>Phone</th>
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
                    <td colSpan="9" className="empty-orders-message">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td className="text-center">{order.id}</td>
                      <td>{order.customer}</td>
                      <td className="text-center">{order.phone}</td>
                      <td className="text-center">${order.amount}</td>
                      <td className="text-center">
                        <span className={`status-badge ${this.getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-center">{order.date}</td>
                      <td className="text-center">{order.items}</td>
                      <td className="text-center">{order.paymentMethod}</td>
                      <td className="text-center">
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
                disabled={!hasPrev}
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
                disabled={!hasNext}
                onClick={() => this.handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        </div>
      </AuthGuard>
    );
  }
}

export default AdminOrders;
