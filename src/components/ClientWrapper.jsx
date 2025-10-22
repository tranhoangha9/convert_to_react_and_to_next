'use client';
import React, { Component } from 'react';

class ClientWrapper extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('appStarted')) {
      const isReload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
      if (!isReload) {
        localStorage.removeItem('user');
        sessionStorage.setItem('appStarted', 'true');
      }
    }
  }

  render() {
    return <>{this.props.children}</>;
  }
}

export default ClientWrapper;