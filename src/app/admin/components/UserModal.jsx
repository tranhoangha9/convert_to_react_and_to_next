import React, { Component } from 'react';
import '../styles/admin.css';

class UserModal extends Component {
  constructor(props) {
    super(props);

    const defaultState = {
      name: '',
      email: '',
      password: '',
      role: 'customer',
      phone: '',
      address: ''
    };

    const userData = props.user ? {
      name: props.user.name || '',
      email: props.user.email || '',
      password: props.user.password || '',
      role: props.user.role || 'customer',
      phone: props.user.phone || '',
      address: props.user.address || ''
    } : {};

    this.state = {
      ...defaultState,
      ...userData,
      adminPassword: '',
      originalRole: props.user?.role || 'user',
      currentAdminId: null
    };
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      let adminId = null;
      try {
        const storedAdmin = sessionStorage.getItem('adminUser') || localStorage.getItem('adminUser');
        if (storedAdmin) {
          const parsed = JSON.parse(storedAdmin);
          if (parsed && parsed.id) {
            adminId = parsed.id;
          }
        }
      } catch (error) {
        console.error('Error reading admin user from storage:', error);
      }

      this.setState({ currentAdminId: adminId });
    }
  }

  handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState({
      [name]: type === 'checkbox' ? checked : value
    });
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, phone, role, originalRole, adminPassword, currentAdminId } = this.state;
    const isEditing = this.props.user && this.props.user.id;
    const editingUserId = this.props.user?.id;

    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    if (!email.trim()) {
      alert('Please enter an email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Invalid email address');
      return;
    }

    if (!isEditing && !password) {
      alert('Please enter a password');
      return;
    }

    if (!isEditing && password && password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    if (phone && phone.trim() && !/^[0-9+\-\s()]+$/.test(phone.trim())) {
      alert('Invalid phone number');
      return;
    }

    const isEditingOtherAdmin = isEditing && originalRole === 'admin' && (currentAdminId === null || String(currentAdminId) !== String(editingUserId));
    const isRoleChangingBetweenStaffAdmin = isEditing && ((originalRole === 'staff' && role === 'admin') || (originalRole === 'admin' && role === 'staff'));
    const requiresSecondPassword = isEditingOtherAdmin || isRoleChangingBetweenStaffAdmin;

    if (requiresSecondPassword) {
      if (!adminPassword.trim()) {
        alert('Please enter the secondary password');
        return;
      }
    }

    if (isEditing && (originalRole === 'admin' || originalRole === 'staff') && role === 'user') {
      alert('Cannot convert Admin/Staff to User!');
      return;
    }

    try {
      const userData = {
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: this.state.role,
        phone: this.state.phone.trim(),
        address: this.state.address.trim()
      };

      if (isEditing) {
        delete userData.password;
        if (requiresSecondPassword) {
          userData.adminPassword = adminPassword.trim();
        }
      }

      let token = '';
      if (typeof window !== 'undefined') {
        token = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken') || '';
      }

      const response = await fetch(isEditing ? `/api/admin/users/${this.props.user.id}` : '/api/admin/users', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        this.props.onClose();
        this.props.onSuccess();
        alert(isEditing ? 'User updated successfully!' : 'User created successfully!');
      } else {
        alert(data.error || 'An error occurred');
      }
    } catch (error) {
      alert('Error saving user');
    }
  }

  render() {
    const { onClose, user, isEditable = true, isUserTab = false } = this.props;
    const isViewOnly = user && user.id && user.role !== 'admin' && user.role !== 'staff';
    const isEditingOtherAdmin = user && user.id && this.state.originalRole === 'admin' && (this.state.currentAdminId === null || String(this.state.currentAdminId) !== String(user.id));
    const isEditingRoleChange = user && user.id && 
      ((this.state.originalRole === 'staff' && this.state.role === 'admin') || 
       (this.state.originalRole === 'admin' && this.state.role === 'staff'));
    const shouldShowSecondPasswordInput = isEditingOtherAdmin || isEditingRoleChange;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>
              {user && user.id ? (isUserTab ? 'User Information' : (user.role === 'staff' || user.role === 'admin' ? 'Edit Staff/Admin' : 'Edit User')) : (user && user.role === 'staff' ? 'Add Staff' : 'Add New User')}
            </h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          <form className="user-form" onSubmit={this.handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={this.state.name}
                  onChange={this.handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={this.state.email}
                  onChange={this.handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={user && user.id ? '••••••••' : this.state.password}
                  onChange={this.handleInputChange}
                  placeholder={user && user.id ? 'Leave blank to keep current' : 'Enter password'}
                  disabled={user && user.id}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={this.state.role}
                  onChange={this.handleInputChange}
                  disabled={isUserTab || isViewOnly}
                >
                  {(this.state.originalRole === 'admin' || this.state.originalRole === 'staff') ? (
                    <>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </>
                  ) : (
                    <>
                      <option value="user">User</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={this.state.phone}
                  onChange={this.handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={this.state.address}
                rows="3"
                onChange={this.handleInputChange}
              />
            </div>

            {shouldShowSecondPasswordInput && (
              <div className="form-group">
                <input
                  type="password"
                  name="adminPassword"
                  className="second-password-input"
                  value={this.state.adminPassword}
                  onChange={this.handleInputChange}
                  placeholder="Enter secondary password"
                  required
                />
              </div>
            )}

            <div className="modal-actions">
              {!isViewOnly && (
                <button type="submit" className="btn-primary">
                  {user && user.id ? 'Update' : 'Create'}
                </button>
              )}
              <button type="button" className="btn-secondary" onClick={onClose}>
                {isViewOnly ? 'Close' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default UserModal;
