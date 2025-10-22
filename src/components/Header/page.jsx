'use client';
import React, { Component } from 'react';
import Link from 'next/link';
import './Header.css';
import CartModal from '../CartModal/CartModal';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobileMenuOpen: false,
      user: null,
      isCartOpen: false
    };
  }

  componentDidMount() {
    this.checkAuth();
  }

  checkAuth = () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          this.setState({ user: JSON.parse(user) });
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }

  toggleMenu = () => {
    this.setState(prev => ({
      isMobileMenuOpen: !prev.isMobileMenuOpen
    }));
  }

  toggleCart = () => {
    this.setState(prev => ({
      isCartOpen: !prev.isCartOpen
    }));
  }

  render() {
    const { isMobileMenuOpen, user, isCartOpen } = this.state;
    
    return (
      <header className="navbar">
        <div className="container">
          <div className="nav-logo">
            <Link href="/" aria-label="Go to homepage"><img src="/assets/images/logo.png" alt="Cora'l - Premium Handbags & Fashion Accessories" loading="lazy" /></Link>
          </div>
          <input type="checkbox" className="search-toggle" id="search-toggle" />
          <label htmlFor="search-toggle" className="search-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </label>
          <div className="search-box">
            <input type="text" placeholder="Search for products or brands..." />
          </div>
          <input 
            type="checkbox" 
            className="menu-toggle" 
            id="menu-toggle" 
            checked={isMobileMenuOpen} 
            onChange={this.toggleMenu} 
          />
            <label htmlFor="menu-toggle" className="hamburger" aria-label="Toggle navigation menu">
              <span></span>
              <span></span>
              <span></span>
            </label>
          <nav className="nav-menu">
            <label htmlFor="menu-toggle" className="menu-close">×</label>
            <ul className="nav-menu-list">
              <li><Link href="/client/category/handbags">Handbags</Link></li>
              <li><Link href="/client/category/watches">Watches</Link></li>
              <li><Link href="/client/category/skincare">Skincare</Link></li>
              <li><Link href="/client/category/jewellery">Jewellery</Link></li>
              <li><Link href="/client/category/apparels">Apparels</Link></li>
            </ul>
            <div className="nav-icons">
              <Link href="#" aria-label="View wishlist">
                <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 18.25C11 18.25 1.625 13 1.625 6.62501C1.62519 5.49826 2.01561 4.40635 2.72989 3.53493C3.44416 2.66351 4.4382 1.35738 5.54299 1.84501C6.64778 0.914685 7.79514 1.0828 8.78999 1.6118C9.78484 2.1408 10.5658 2.99803 11 4.03774L11 4.03775C11.4342 2.99804 12.2152 2.14081 13.21 1.61181C14.2049 1.08281 15.3522 0.914686 16.457 1.13603C17.5618 1.35737 18.5558 1.95452 19.2701 3.53493C19.9844 3.69737 20.3748 4.78927 20.375 5.91602C20.375 13 11 18.25 11 18.25Z" stroke="#1B4B66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href={user ? "/client/account" : "/client/auth/login"} aria-label={user ? "View account" : "Sign in"}>
                <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 18C3.33579 15.5226 6.50702 14 10 14C13.493 14 16.6642 15.5226 19 18M14.5 5.5C14.5 7.98528 12.4853 10 10 10C7.51472 10 5.5 7.98528 5.5 5.5C5.5 3.01472 7.51472 1 10 1C12.4853 1 14.5 3.01472 14.5 5.5Z" stroke="#1B4B66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <button onClick={this.toggleCart} className="cart-button-mobile" aria-label="Open shopping cart">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.5787 6.75H4.42122C4.23665 6.75 4.05856 6.81806 3.92103 6.94115C3.7835 7.06425 3.69619 7.23373 3.67581 7.41718L2.34248 19.4172C2.33083 19.522 2.34143 19.6281 2.37357 19.7286C2.40572 19.829 2.4587 19.9216 2.52904 20.0002C2.59939 20.0788 2.68553 20.1417 2.78182 20.1847C2.87812 20.2278 2.98241 20.25 3.08789 20.25H20.912C21.0175 20.25 21.1218 20.2278 21.2181 20.1847C21.3144 20.1417 21.4005 20.0788 21.4708 20.0002C21.5412 19.9216 21.5942 19.829 21.6263 19.7286C21.6585 19.6281 21.6691 19.522 21.6574 19.4172L20.3241 7.41718C20.3037 7.23373 20.2164 7.06425 20.0789 6.94115C19.9413 6.81806 19.7632 6.75 19.5787 6.75Z" stroke="#1B4B66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.25 5.75C8.25 4.75544 8.64509 3.80161 9.34835 3.09835C10.0516 2.39509 11.0054 2 12 2C12.9946 2 13.9484 2.39509 14.6517 3.09835C15.3549 3.80161 15.75 4.75544 15.75 5.75" stroke="#1B4B66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </nav>
          <div className="nav-right">
            <div className="search-box">
              <span className="search-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M10.875 4C7.07804 4 4 7.07804 4 10.875C4 14.672 7.07804 17.75 10.875 17.75C14.672 17.75 17.75 14.672 17.75 10.875C17.75 7.07804 14.672 4 10.875 4ZM2 10.875C2 5.97347 5.97347 2 10.875 2C15.7765 2 19.75 5.97347 19.75 10.875C19.75 15.7765 15.7765 19.75 10.875 19.75C5.97347 19.75 2 15.7765 2 10.875Z"
                    fill="#13101E" />
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M15.736 15.7363C16.1265 15.3457 16.7597 15.3457 17.1502 15.7363L21.7065 20.2926C22.0971 20.6831 22.0971 21.3162 21.7065 21.7068C21.316 22.0973 20.6828 22.0973 20.2923 21.7068L15.736 17.1505C15.3455 16.7599 15.3455 16.1268 15.736 15.7363Z"
                    fill="#13101E" />
                </svg>
              </span>
              <input type="text" placeholder="Search for products or brands" />
            </div>

            <div className="nav-icons">
              <Link href="#" aria-label="View wishlist">
                <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M11 18.25C11 18.25 1.625 13 1.625 6.62501C1.62519 5.49826 2.01561 4.40635 2.72989 3.53493C3.44416 2.66351 4.4382 1.35738 5.54299 1.84501C6.64778 0.914685 7.79514 1.0828 8.78999 1.6118C9.78484 2.1408 10.5658 2.99803 11 4.03774L11 4.03775C11.4342 2.99804 12.2152 2.14081 13.21 1.61181C14.2049 1.08281 15.3522 0.914686 16.457 1.13603C17.5618 1.35737 18.5558 1.95452 19.2701 3.53493C19.9844 3.69737 20.3748 4.78927 20.375 5.91602C20.375 13 11 18.25 11 18.25Z"
                    stroke="#1B4B66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href={user ? "/client/account" : "/client/auth/login"} aria-label={user ? "View account" : "Sign in"}>
                <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1 18C3.33579 15.5226 6.50702 14 10 14C13.493 14 16.6642 15.5226 19 18M14.5 5.5C14.5 7.98528 12.4853 10 10 10C7.51472 10 5.5 7.98528 5.5 5.5C5.5 3.01472 7.51472 1 10 1C12.4853 1 14.5 3.01472 14.5 5.5Z"
                    stroke="#1B4B66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <button onClick={this.toggleCart} className="cart-button" aria-label="Open shopping cart">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19.5787 6.75H4.42122C4.23665 6.75 4.05856 6.81806 3.92103 6.94115C3.7835 7.06425 3.69619 7.23373 3.67581 7.41718L2.34248 19.4172C2.33083 19.522 2.34143 19.6281 2.37357 19.7286C2.40572 19.829 2.4587 19.9216 2.52904 20.0002C2.59939 20.0788 2.68553 20.1417 2.78182 20.1847C2.87812 20.2278 2.98241 20.25 3.08789 20.25H20.912C21.0175 20.25 21.1218 20.2278 21.2181 20.1847C21.3144 20.1417 21.4005 20.0788 21.4708 20.0002C21.5412 19.9216 21.5942 19.829 21.6263 19.7286C21.6585 19.6281 21.6691 19.522 21.6574 19.4172L20.3241 7.41718C20.3037 7.23373 20.2164 7.06425 20.0789 6.94115C19.9413 6.81806 19.7632 6.75 19.5787 6.75Z"
                    stroke="#1B4B66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="M8.25 5.75C8.25 4.75544 8.64509 3.80161 9.34835 3.09835C10.0516 2.39509 11.0054 2 12 2C12.9946 2 13.9484 2.39509 14.6517 3.09835C15.3549 3.80161 15.75 4.75544 15.75 5.75"
                    stroke="#1B4B66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <CartModal 
          isOpen={isCartOpen}
          onClose={this.toggleCart}
        />
      </header>
    );
  }
}

export default Header;