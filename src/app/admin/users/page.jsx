'use client';
import React, { Component } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import UserModal from '../components/UserModal';
import '../admin.css';
import './users.css';

class AdminUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      currentPage: 1,
      totalPages: 1,
      searchTerm: '',
      roleFilter: 'all',
      activeTab: 'users',
      showModal: false,
      editingUser: null
    };
    this.searchTimeout = null;
  }

  async componentDidMount() {
    this.fetchUsers();
  }

  componentWillUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (
      prevState.currentPage !== this.state.currentPage ||
      prevState.searchTerm !== this.state.searchTerm ||
      prevState.roleFilter !== this.state.roleFilter ||
      prevState.activeTab !== this.state.activeTab
    ) {
      if (!this.searchTimeout) {
        this.fetchUsers();
      }
    }
  }

  fetchUsers = async () => {
    try {
      this.setState({ loading: true });

      let roleParam = this.state.roleFilter;
      if (this.state.activeTab === 'admins') {
        roleParam = 'admin';
      } else if (this.state.activeTab === 'users') {
        roleParam = 'all';
      }

      const response = await fetch(`/api/admin/users?page=${this.state.currentPage}&search=${this.state.searchTerm}&role=${roleParam}`);
      const data = await response.json();

      if (data.success) {
        let filteredUsers = data.users;
        if (this.state.activeTab === 'users') {
          filteredUsers = data.users.filter(user => user.role !== 'admin');
        } else if (this.state.activeTab === 'admins') {
          filteredUsers = data.users.filter(user => user.role === 'admin');
        }

        this.setState({
          users: filteredUsers,
          totalPages: data.pagination.totalPages,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Lỗi khi tải danh sách người dùng');
      this.setState({ loading: false });
    }
  };

  handleSearchChange = (e) => {
    const value = e.target.value;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.setState({
        searchTerm: value,
        currentPage: 1
      });
      this.searchTimeout = null;
    }, 2000);
  };

  handleRoleFilterChange = (e) => {
    this.setState({
      roleFilter: e.target.value,
      currentPage: 1
    });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleTabChange = (tab) => {
    this.setState({
      activeTab: tab,
      currentPage: 1,
      roleFilter: 'all'
    });
  };

  handleEditUser = (user) => {
    this.setState({
      showModal: true,
      editingUser: user
    });
  };

  handleDeleteUser = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa user này?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        this.fetchUsers();
      } else {
        alert(data.error || 'Có lỗi xảy ra khi xóa user');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa user');
    }
  };

  handleModalClose = () => {
    this.setState({
      showModal: false,
      editingUser: null
    });
  };

  handleModalSuccess = () => {
    this.setState({
      showModal: false,
      editingUser: null
    });
    this.fetchUsers();
  };

  getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return 'role-admin';
      case 'manager': return 'role-manager';
      case 'user':
      case 'customer': return 'role-customer';
      default: return 'role-default';
    }
  };

  getStatusBadgeClass = (status) => {
    return status === 'active' ? 'status-active' : 'status-inactive';
  };

  render() {
    const { users, loading, currentPage, totalPages, searchTerm, activeTab, showModal, editingUser } = this.state;

    if (loading) {
      return (
        <div className="admin-container">
          <AdminSidebar currentPath="/admin/users" />
          <div className="admin-content">
            <div className="loading-spinner">Loading users...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-container">
        <AdminSidebar currentPath="/admin/users" />
        <div className="admin-content">
          <div className="admin-users">
            <div className="users-tabs">
              <button
                className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => this.handleTabChange('users')}
              >
                Users
              </button>
              <button
                className={`tab-button ${activeTab === 'admins' ? 'active' : ''}`}
                onClick={() => this.handleTabChange('admins')}
              >
                Admins
              </button>
            </div>

            <div className="users-controls">
              <div className="users-search-box">
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={this.handleSearchChange}
                />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>

            <div className="admin-card">
              <h3>{activeTab === 'admins' ? 'Admins' : 'Users'} Management</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    {activeTab !== 'admins' && <th>ID</th>}
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Phone</th>
                    {activeTab === 'users' && <th>Orders</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === 'users' ? "8" : "7"} className="empty-users-message">
                        Chưa có {activeTab === 'admins' ? 'admin' : 'user'} nào
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id}>
                        {activeTab !== 'admins' && <td className="user-id">{user.id}</td>}
                        <td className="user-name">{user.name}</td>
                        <td className="user-email">{user.email}</td>
                        <td>
                          <span className={`status-badge ${this.getStatusBadgeClass(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="user-join-date">{user.phone || 'N/A'}</td>
                        {activeTab === 'users' && <td className="user-orders">{user.ordersCount || 0}</td>}
                        <td className="user-actions">
                          <button className="btn-small btn-view" onClick={() => this.handleEditUser(user)}>View</button>
                          <button className="btn-small btn-delete" onClick={() => this.handleDeleteUser(user.id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
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
            )}
          </div>
        </div>

        {showModal && (
          <UserModal
            user={editingUser}
            onClose={this.handleModalClose}
            onSuccess={this.handleModalSuccess}
          />
        )}
      </div>
    );
  }
}

export default AdminUsers;
