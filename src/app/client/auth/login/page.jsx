'use client';
import React, { Component } from 'react';
import Link from 'next/link';
import '../auth.css';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: '',
      loading: false
    };
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      if (redirectUrl) {
        this.setState({ redirectUrl });
      }
    }
  }

  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      error: ''
    });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password, redirectUrl } = this.state;

    this.setState({ loading: true, error: '' });
    if (!username || !password) {
      this.setState({
        error: 'Please fill in all required fields',
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
        const { loginUser } = await import('@/lib/authService');
        loginUser(data.user);

        if (typeof window !== 'undefined') {
          localStorage.setItem('userToken', data.token);
        }

        try {
          const { mergeLocalCartToDb } = await import('@/lib/cartService');
          await mergeLocalCartToDb(data.user.id);
        } catch (error) {
          console.error('Error merging cart:', error);
        }

        const redirectTo = redirectUrl || '/client/account';
        window.location.href = redirectTo;
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
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Sign In</h1>
          </div>

          <form onSubmit={this.handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Email</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={this.handleInputChange}
                placeholder="Enter your email"
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
                placeholder="Enter your password"
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-link">
              Don't have an account? <Link href="/client/auth/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
