'use client';
import React, { Component } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import UserModal from '../components/UserModal';
import AuthGuard from '../components/AuthGuard';
import '../styles/admin.css';
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
        roleParam = 'all';
      } else if (this.state.activeTab === 'users') {
        roleParam = 'all';
      }

      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const response = await fetch(`/api/admin/users?page=${this.state.currentPage}&search=${this.state.searchTerm}&role=${roleParam}`, {
        headers: {
          'x-admin-user': JSON.stringify(adminUser)
        }
      });
      const data = await response.json();

      if (data.success) {
        let filteredUsers = data.users;
        if (this.state.activeTab === 'users') {
          filteredUsers = data.users.filter(user => user.role !== 'admin' && user.role !== 'staff');
        } else if (this.state.activeTab === 'admins') {
          filteredUsers = data.users.filter(user => user.role === 'admin' || user.role === 'staff');
        }

        this.setState({
          users: filteredUsers,
          totalPages: data.pagination.totalPages,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error loading users');
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

  handleAddStaff = () => {
    this.setState({
      showModal: true,
      editingUser: { role: 'staff' }
    });
  };

  handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-user': JSON.stringify(adminUser)
        }
      });

      const data = await response.json();

      if (data.success) {
        this.fetchUsers();
      } else {
        alert(data.error || 'Error deleting user');
      }
    } catch (error) {
      alert('Error deleting user');
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
      case 'staff': return 'role-staff';
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
        <AuthGuard>
          <div className="admin-container">
            <AdminSidebar currentPath="/admin/users" />
            <div className="admin-content">
              <div className="loading-spinner">Loading users...</div>
            </div>
          </div>
        </AuthGuard>
      );
    }

    return (
      <AuthGuard>
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
              <div className="admin-card-header">
                <h3>{activeTab === 'admins' ? 'Admins & Staff' : 'Users'} Management</h3>
                {activeTab === 'admins' && (
                  <button className="admin-btn-primary" onClick={this.handleAddStaff}>
                    Add Staff
                  </button>
                )}
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    {activeTab !== 'admins' && <th>ID</th>}
                    <th className="text-left">Name</th>
                    <th className="text-left">Email</th>
                    {activeTab === 'admins' && <th>Role</th>}
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
                        No {activeTab === 'admins' ? 'admins' : 'users'} found
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id}>
                        {activeTab !== 'admins' && <td className="text-center">{user.id}</td>}
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        {activeTab === 'admins' && (
                          <td className="text-center">
                            <span className={`role-badge ${this.getRoleBadgeClass(user.role)}`}>
                              {user.role === 'admin' ? 'Admin' : 'Staff'}
                            </span>
                          </td>
                        )}
                        <td className="text-center">
                          <span className={`status-badge ${this.getStatusBadgeClass(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="text-center">{user.phone || 'N/A'}</td>
                        {activeTab === 'users' && <td className="text-center">{user.ordersCount || 0}</td>}
                        <td className="text-center">
                          <button className="btn-small btn-view" onClick={() => this.handleEditUser(user)}>View</button>
                          {(activeTab === 'admins' || (activeTab === 'users' && user.status === 'active')) && (
                            <button className="btn-small btn-delete" onClick={() => this.handleDeleteUser(user.id)}>Delete</button>
                          )}
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
              isUserTab={activeTab === 'users'}
            />
          )}
        </div>
      </AuthGuard>
    );
  }
}

export default AdminUsers;
