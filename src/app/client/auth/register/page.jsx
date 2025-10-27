'use client';
import React, { Component } from 'react';
import Link from 'next/link';
import '../auth.css';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
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
    const { name, email, password, confirmPassword } = this.state;

    this.setState({ loading: true, error: '' });

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      this.setState({ 
        error: 'Vui lòng nhập đầy đủ thông tin',
        loading: false 
      });
      return;
    }

    if (password.length < 6) {
      this.setState({ 
        error: 'Mật khẩu phải có ít nhất 6 ký tự',
        loading: false 
      });
      return;
    }

    if (password !== confirmPassword) {
      this.setState({ 
        error: 'Mật khẩu xác nhận không khớp',
        loading: false 
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.setState({ 
        error: 'Email không hợp lệ',
        loading: false 
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Đăng ký thành công!');
        window.location.href = '/client/auth/login';
      } else {
        this.setState({ 
          error: data.error || 'Đăng ký thất bại',
          loading: false 
        });
      }
    } catch (error) {
      console.error('Register error:', error);
      this.setState({ 
        error: 'Có lỗi xảy ra khi đăng ký',
        loading: false 
      });
    }
  }

  render() {
    const { name, email, password, confirmPassword, error, loading } = this.state;
    
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Đăng ký</h1>
          </div>
          
          <form onSubmit={this.handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={this.handleInputChange}
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={this.handleInputChange}
                placeholder="Nhập email"
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
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={this.handleInputChange}
                placeholder="Nhập lại mật khẩu"
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
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-link">
              Đã có tài khoản? <Link href="/client/auth/login">Đăng nhập tại đây</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
