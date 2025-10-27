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
        error: 'Please enter all required information',
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
          password: password,
          target: 'admin'
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.user.role !== 'admin' && data.user.role !== 'staff') {
          this.setState({
            error: 'You do not have permission to access admin panel',
            loading: false
          });
          return;
        }

        sessionStorage.setItem('adminUser', JSON.stringify(data.user));

        window.location.href = '/admin/dashboard';
      } else {
        this.setState({
          error: data.error || 'Login failed',
          loading: false
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      this.setState({
        error: 'An error occurred during login',
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
                placeholder="Enter admin email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={this.handleInputChange}
                placeholder="Enter password"
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
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="admin-login-footer">
            <p className="demo-info"> <br />
              admin: tenoteciara@gmail.com || 123123
            </p>
            <p className="back-link">
              <Link href="/">← Back to homepage</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminLogin;
