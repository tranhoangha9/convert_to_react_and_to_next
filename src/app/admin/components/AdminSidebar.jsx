'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../styles/sidebar.css';

const AdminSidebar = ({ currentPath }) => {
  const [adminUser, setAdminUser] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('adminUser') || '{}');
    setAdminUser(user);
    setIsAdmin(user.role === 'admin');
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', adminOnly: true },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/products', label: 'Products' },
  ];

  return (
    <div className="admin-sidebar">
      <h2>Admin Panel</h2>
      <nav className="admin-nav">
        {navItems.filter(item => !item.isBottom && (!item.adminOnly || isAdmin)).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-item ${currentPath === item.href ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="admin-nav-bottom">
        {adminUser.role ? (
          <button
            onClick={handleLogout}
            className="admin-nav-item admin-logout-btn"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/admin/login"
            className="admin-nav-item admin-login-link"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
