'use client';
import { Component } from 'react';
import { useRouter } from 'next/navigation';

class AuthGuardClass extends Component {
  componentDidMount() {
    this.checkAuth();
  }

  checkAuth = () => {
    if (typeof window === 'undefined') return;

    const adminUser = sessionStorage.getItem('adminUser');
    if (!adminUser) {
      window.location.href = '/admin/login';
      return;
    }

    try {
      const user = JSON.parse(adminUser);
      if (!user.role || (user.role !== 'admin' && user.role !== 'staff')) {
        sessionStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      }
    } catch (error) {
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
  };

  render() {
    return this.props.children;
  }
}

export default AuthGuardClass;
