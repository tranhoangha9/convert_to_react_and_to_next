'use client';
import React, { Component } from 'react';
import './account.css';

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      profileImage: null,
      profileImageUrl: null,
      loading: false,
      error: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      countryCode: '',
      address: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  componentDidMount() {
    this.checkAuth();
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (savedProfile) {
      this.setState({
        firstName: savedProfile.firstName || '',
        lastName: savedProfile.lastName || '',
        email: savedProfile.email || '',
        phone: savedProfile.phone || '',
        address: savedProfile.address || '',
        countryCode: savedProfile.countryCode || '',
        dateOfBirth: savedProfile.dateOfBirth || '',
        profileImageUrl: savedProfile.profileImageUrl || null
      });
    }
  }


  checkAuth = async () => {
    const { getCurrentUser } = await import('@/lib/authService');
    const user = getCurrentUser();
    if (!user) {
      window.location.href = '/client/auth/login';
      return;
    }

    try {
      const response = await fetch(`/api/client/users/profile?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        this.setState({ 
          user: data.user,
          email: data.user.email,
          firstName: data.user.name.split(' ')[0] || '',
          lastName: data.user.name.split(' ').slice(1).join(' ') || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          profileImageUrl: data.user.avatar || ''
        });
      } else {
        this.setState({ user: user });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      window.location.href = '/client/auth/login';
    }
  }

  handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      this.setState({
        profileImageUrl: e.target.result
      });

      try {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formDataUpload
        });

        const data = await response.json();

        if (data.success) {
          this.setState({
            profileImageUrl: data.imageUrl
          });
        } else {
          alert('Lỗi khi upload ảnh: ' + data.error);
          this.setState({
            profileImageUrl: null
          });
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Lỗi khi upload ảnh');
        this.setState({
          profileImageUrl: null
        });
      }
    };
    reader.readAsDataURL(file);
  }

  handleSaveProfile = async () => {
    try {
      const { user, firstName, lastName, phone, address, profileImageUrl, newPassword, confirmPassword } = this.state;
      
      if (!user) {
        this.setState({ error: 'Không tìm thấy thông tin user' });
        return;
      }

      if (!firstName.trim() || !lastName.trim()) {
        this.setState({ error: 'Họ và tên không được để trống' });
        return;
      }

      const wantsToChangePassword = newPassword.trim() !== '' || confirmPassword.trim() !== '';
      
      if (wantsToChangePassword) {
        if (newPassword !== confirmPassword) {
          this.setState({ error: 'Mật khẩu xác nhận không khớp' });
          return;
        }
        
        if (newPassword.length < 6) {
          this.setState({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
          return;
        }

        const passwordResponse = await fetch('/api/client/users/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            newPassword: newPassword
          })
        });

        const passwordData = await passwordResponse.json();
        if (!passwordData.success) {
          this.setState({ error: passwordData.error || 'Có lỗi xảy ra khi đổi mật khẩu' });
          return;
        }
      }

      const updateData = {
        name: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.trim(),
        address: address.trim(),
        avatar: profileImageUrl
      };

      const response = await fetch('/api/client/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...updateData
        })
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user, ...updateData };
        const { loginUser } = await import('@/lib/authService');
        loginUser(updatedUser);

        this.setState({ 
          user: updatedUser,
          error: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        const message = wantsToChangePassword 
          ? 'Thông tin và mật khẩu đã được cập nhật thành công!' 
          : 'Thông tin đã được lưu thành công!';
        alert(message);
      } else {
        this.setState({ error: data.error || 'Có lỗi xảy ra khi lưu thông tin' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      this.setState({ error: 'Có lỗi xảy ra khi lưu thông tin' });
    }
  }

  handleInputChange = (e) => {  
    const { name, value } = e.target;
    this.setState({ [name]: value, error: '' });
  }

  handleDeleteProfile = () => {
    localStorage.removeItem('profileImage');
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (savedProfile){
      savedProfile.profileImageUrl = null;
      localStorage.setItem('userProfile', JSON.stringify(savedProfile));
    }
    this.setState({ profileImage: null, profileImageUrl: null });
  }

  handleLogout = async () => {
    const { logoutUser } = await import('@/lib/authService');
    logoutUser();
    window.location.href = '/client/auth/login';
  }

  render() {
    const { user, profileImageUrl, error } = this.state;

    if (!user) {
      return <div>Đang kiểm tra đăng nhập...</div>;
    }

    return (
      <div className="account-container">
        <div className="account-sidebar">
          <div className="sidebar-card">
            <nav className="sidebar-menu">
              <a href="#personal-info" className="menu-item active" aria-label="View personal information">
                Personal Information
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#refer-earn" className="menu-item" aria-label="View refer and earn section">
                Refer and Earn
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#my-orders" className="menu-item" aria-label="View my orders">
                My Orders
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#my-wishlist" className="menu-item" aria-label="View my wishlist">
                My Wishlist
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#my-reviews" className="menu-item" aria-label="View my reviews">
                My Reviews
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#my-address" className="menu-item" aria-label="View my address book">
                My Address Book
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#my-cards" className="menu-item" aria-label="View my saved cards">
                My Saved Cards
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </nav>
          </div>
        </div>

        <div className="account-main">
          <div className="main-header">
            <h1>Personal Information</h1>
            <button onClick={this.handleLogout} className="logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Logout
            </button>
          </div>
          <hr className="main-divider" />
          <div className="profile-picture-area">
            <div className="profile-avatar">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="7" r="4" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>

            <div className="profile-actions">
              <input
                type="file"
                id="profileImage"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={this.handleImageChange}
                className="file-input"
              />
              <label htmlFor="profileImage" className="upload-btn">
                Upload
              </label>
              {profileImageUrl && (
                <button className="delete-btn" onClick={this.handleDeleteProfile}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </div>

          <div className="info-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" value={this.state.firstName} onChange={this.handleInputChange} name="firstName"/>
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" value={this.state.lastName} onChange={this.handleInputChange} name="lastName"/>
              </div>
            </div>

            <div className="form-row form-row-contact">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={this.state.email} onChange={this.handleInputChange} name="email"/>
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <div className="phone-input">
                  <input type="text" className="country-code" value={this.state.countryCode} onChange={this.handleInputChange} name='countryCode' />
                  <input type="text" className="phone-number"  value={this.state.phone} onChange={this.handleInputChange} name="phone" />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of birth</label>
                <div className="date-input">
                  <input type="date" value={this.state.dateOfBirth} onChange={this.handleInputChange} name="dateOfBirth"/>
                </div>
              </div>
            </div>
          </div>

          <div className="section-divider">
            <h2>Change Password</h2>
            <hr />
          </div>

          <div className="password-form">
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={this.state.newPassword}
                onChange={this.handleInputChange}
                placeholder="Nhập mật khẩu mới (để trống nếu không đổi)"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={this.state.confirmPassword}
                onChange={this.handleInputChange}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            {this.state.error && (
              <div className="error-message">
                {this.state.error}
              </div>
            )}
          </div>

          <div className="save-section">
            <button className="save-changes-btn" onClick={this.handleSaveProfile}>
              Save Changes
            </button>
          </div>

        
        </div>
      </div>
    );
  }
}

export default Account;
