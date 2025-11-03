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
        error: 'Please fill in all required fields',
        loading: false 
      });
      return;
    }

    if (password.length < 6) {
      this.setState({ 
        error: 'Password must be at least 6 characters',
        loading: false 
      });
      return;
    }

    if (password !== confirmPassword) {
      this.setState({ 
        error: 'Password confirmation does not match',
        loading: false 
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.setState({ 
        error: 'Invalid email address',
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
        alert('Registration successful!');
        window.location.href = '/client/auth/login';
      } else {
        this.setState({ 
          error: data.error || 'Registration failed',
          loading: false 
        });
      }
    } catch (error) {
      console.error('Register error:', error);
      this.setState({ 
        error: 'An error occurred during registration',
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
            <h1>Sign Up</h1>
          </div>
          
          <form onSubmit={this.handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={this.handleInputChange}
                placeholder="Enter your full name"
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
                placeholder="Enter password (minimum 6 characters)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={this.handleInputChange}
                placeholder="Re-enter your password"
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
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-link">
              Already have an account? <Link href="/client/auth/login">Log in here</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
