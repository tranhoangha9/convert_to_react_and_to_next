'use client';
import React, { Component } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AuthGuard from '../components/AuthGuard';
import '../styles/admin.css';
import './dashboard.css';

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: {
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0
      },
      recentOrders: [],
      topProducts: [],
      loading: true
    };
  }

  async componentDidMount() {
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (adminUser.role === 'staff') {
      window.location.href = '/admin/users';
      return;
    }
    await this.fetchDashboardData();
  }

  fetchDashboardData = async () => {
    try {
      this.setState({ loading: true });

      const statsResponse = await fetch('/api/admin/dashboard/stats');
      const statsData = await statsResponse.json();

      const ordersResponse = await fetch('/api/admin/dashboard/recent-orders');
      const ordersData = await ordersResponse.json();

      const productsResponse = await fetch('/api/admin/dashboard/top-products');
      const productsData = await productsResponse.json();

      if (statsData.success && ordersData.success && productsData.success) {
        this.setState({
          stats: statsData.stats,
          recentOrders: ordersData.orders,
          topProducts: productsData.products,
          loading: false
        });
      } else {
        console.error('Error fetching dashboard data');
        this.setState({ loading: false });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      this.setState({ loading: false });
    }
  };

  render() {
    const { stats, recentOrders, topProducts, loading } = this.state;

    if (loading) {
      return (
        <AuthGuard>
          <div className="admin-container">
            <AdminSidebar currentPath="/admin/dashboard" />
            <div className="admin-content">
              <div className="loading-spinner">Loading dashboard...</div>
            </div>
          </div>
        </AuthGuard>
      );
    }

    return (
      <AuthGuard>
        <div className="admin-container">
          <AdminSidebar currentPath="/admin/dashboard" />
        <div className="admin-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-info">
                <h3>{stats.totalProducts}</h3>
                <p>Total Products</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-info">
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-info">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-info">
                <h3>${stats.totalRevenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="dashboard-section">
              <h2>Recent Orders</h2>
              <div className="admin-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>${order.amount}</td>
                        <td>
                          <span className={`status-badge status-${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="dashboard-section">
              <h2>Top Products</h2>
              <div className="products-list">
                {topProducts.map((product, index) => (
                  <div key={index} className="product-item">
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p>{product.sales} sales</p>
                    </div>
                    <div className="product-revenue">
                      <span>{product.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </AuthGuard>
    );
  }
}

export default AdminDashboard;
