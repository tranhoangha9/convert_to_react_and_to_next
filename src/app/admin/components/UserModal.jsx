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
      originalRole: props.user?.role || 'user'
    };
  }

  handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState({
      [name]: type === 'checkbox' ? checked : value
    });
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, phone, role, originalRole, adminPassword } = this.state;
    const isEditing = this.props.user && this.props.user.id;

    if (!name.trim()) {
      alert('Vui lòng nhập tên');
      return;
    }

    if (!email.trim()) {
      alert('Vui lòng nhập email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Email không hợp lệ');
      return;
    }

    if (!isEditing && !password) {
      alert('Vui lòng nhập mật khẩu');
      return;
    }

    if (!isEditing && password && password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (phone && phone.trim() && !/^[0-9+\-\s()]+$/.test(phone.trim())) {
      alert('Số điện thoại không hợp lệ');
      return;
    }

    if (isEditing && ((originalRole === 'staff' && role === 'admin') || (originalRole === 'admin' && role === 'staff'))) {
      if (adminPassword !== 'okadmindeptrai') {
        alert('Mật khẩu cấp 2 không đúng!');
        return;
      }
    }

    if (isEditing && (originalRole === 'admin' || originalRole === 'staff') && role === 'user') {
      alert('Không thể chuyển Admin/Staff thành User!');
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
      }

      let adminUser = {};
      if (typeof window !== 'undefined') {
        const sessionAdmin = sessionStorage.getItem('adminUser');
        const localAdmin = localStorage.getItem('adminUser');
        adminUser = JSON.parse(sessionAdmin || localAdmin || '{}');
      }
      const response = await fetch(isEditing ? `/api/admin/users/${this.props.user.id}` : '/api/admin/users', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-user': JSON.stringify(adminUser)
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        this.props.onClose();
        this.props.onSuccess();
        alert(isEditing ? 'Cập nhật người dùng thành công!' : 'Tạo người dùng thành công!');
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      alert('Lỗi khi lưu người dùng');
    }
  }

  render() {
    const { onClose, user, isEditable = true, isUserTab = false } = this.props;
    const isViewOnly = user && user.id && user.role !== 'admin' && user.role !== 'staff';
    const isStaffModal = user && (user.role === 'staff' || user.role === 'admin');
    const isEditingRoleChange = user && user.id && 
      ((this.state.originalRole === 'staff' && this.state.role === 'admin') || 
       (this.state.originalRole === 'admin' && this.state.role === 'staff'));

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

            {isEditingRoleChange && (
              <div className="form-group">
                <label style={{color: '#dc2626', fontWeight: 'bold'}}>Mật khẩu cấp 2 (bắt buộc khi thay đổi Admin ↔ Staff)</label>
                <input
                  type="password"
                  name="adminPassword"
                  value={this.state.adminPassword}
                  onChange={this.handleInputChange}
                  placeholder="Nhập mật khẩu cấp 2"
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
