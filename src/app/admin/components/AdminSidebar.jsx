'use client';
import React from 'react';
import Link from 'next/link';

const AdminSidebar = ({ currentPath }) => {
  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/login', label: 'Login', isBottom: true },
  ];

  return (
    <div className="admin-sidebar">
      <h2>Admin Panel</h2>
      <nav className="admin-nav">
        {navItems.filter(item => !item.isBottom).map((item) => (
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
        {navItems.filter(item => item.isBottom).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-item ${currentPath === item.href ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
