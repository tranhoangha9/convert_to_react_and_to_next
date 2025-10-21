'use client';
import React, { Component } from 'react';
import './Notification.css';

class Notification extends Component {
  render() {
    return (
      <section className="notification">
        <div className="container">
          <marquee behavior="" direction=""> <p>
            We are currently experiencing local customs clearance delays. For the
            latest updates, please check your order status <a href="#" className="order-status-link" aria-label="Check order status">here</a>
          </p> </marquee>
        </div>
      </section>
    );
  }
}

export default Notification;