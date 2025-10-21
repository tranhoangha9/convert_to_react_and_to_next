import React, { Component } from 'react';

class UserModal extends Component {
  constructor(props) {
    super(props);

    const defaultState = {
      name: '',
      email: '',
      password: '',
      role: 'customer',
      isActive: true,
      phone: '',
      address: ''
    };

    const userData = props.user ? {
      name: props.user.name || '',
      email: props.user.email || '',
      password: props.user.password || '',
      role: props.user.role || 'customer',
      isActive: props.user.isActive !== undefined ? props.user.isActive : true,
      phone: props.user.phone || '',
      address: props.user.address || ''
    } : {};

    this.state = {
      ...defaultState,
      ...userData
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

    if (!this.state.name || !this.state.email || (!this.props.user && !this.state.password)) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const userData = {
        name: this.state.name,
        email: this.state.email,
        password: this.state.password,
        role: this.state.role,
        isActive: this.state.isActive,
        phone: this.state.phone,
        address: this.state.address
      };

      if (this.props.user) {
        // Edit user - bỏ password nếu không thay đổi
        delete userData.password;
      }

      const response = await fetch(this.props.user ? `/api/admin/users/${this.props.user.id}` : '/api/admin/users', {
        method: this.props.user ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        this.props.onClose();
        this.props.onSuccess();
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu');
    }
  }

  render() {
    const { onClose, user, isEditable = true } = this.props;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>
              {user ? 'View User' : 'Add New User'}
            </h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          <form className="user-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={this.state.name}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={this.state.email}
                  disabled
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={this.state.password}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={this.state.role}
                  disabled
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
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
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <div className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={this.state.isActive}
                    disabled
                  />
                  <span>Active</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={this.state.address}
                rows="3"
                disabled
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default UserModal;
