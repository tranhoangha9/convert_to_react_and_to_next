'use client';
import React, { Component } from 'react';
import Link from 'next/link';
import './login.css';

class AdminLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: '',
      loading: false
    };
  }

  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      error: ''
    });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;

    this.setState({ loading: true, error: '' });
    if (!username || !password) {
      this.setState({
        error: 'Vui lòng nhập đầy đủ thông tin',
        loading: false
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.user.role !== 'admin') {
          this.setState({
            error: 'Bạn không có quyền truy cập admin panel',
            loading: false
          });
          return;
        }

        localStorage.setItem('adminUser', JSON.stringify(data.user));

        window.location.href = '/admin/dashboard';
      } else {
        this.setState({
          error: data.error || 'Đăng nhập thất bại',
          loading: false
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      this.setState({
        error: 'Có lỗi xảy ra khi đăng nhập',
        loading: false
      });
    }
  }

  render() {
    const { username, password, error, loading } = this.state;
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1>Admin Login</h1>
            <p>Đăng nhập vào hệ thống quản trị</p>
          </div>

          <form onSubmit={this.handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="username">Email</label>
              <input
                type="email"
                id="username"
                name="username"
                value={username}
                onChange={this.handleInputChange}
                placeholder="Nhập email admin"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={this.handleInputChange}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="admin-login-footer">
            <p className="demo-info">
              Demo: admin@example.com ||| password123
            </p>
            <p className="back-link">
              <Link href="/client">← Quay lại trang chủ</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminLogin;
