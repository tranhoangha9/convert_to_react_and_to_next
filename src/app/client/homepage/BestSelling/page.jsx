'use client';
import React, { Component } from 'react';
import './BestSelling.css';
import Link from 'next/link';

class BestSelling extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      loading: true,
      error: null
    };
  }

  async componentDidMount() {
    await this.loadProducts();
  }

  loadProducts = async () => {
    try {
      this.setState({ loading: true, error: null });

      const response = await fetch('/api/client/products?limit=4&page=1');
      const data = await response.json();

      if (data.success) {
        this.setState({ products: data.products });
      } else {
        this.setState({ error: data.error || 'Unable to load products' });
      }
    } catch (error) {
      console.error('Error loading products:', error);
      this.setState({ error: 'Network error' });
    } finally {
      this.setState({ loading: false });
    }
  }

  addToCart = async (product) => {
    console.log('Adding to cart (homepage):', product);
    try {
      const { addToCart: addToCartService } = await import('@/lib/cartService');
      const success = await addToCartService(product, 1);

      console.log('Add to cart result (homepage):', success);

      if (success) {
        alert(`Added "${product.name}" to the cart!`);
      } else {
        alert('An error occurred while adding the item to the cart.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('An error occurred while adding the item to the cart.');
    }
  }

  render() {
    const { products, loading, error } = this.state;

    if (loading) {
      return (
        <section className="new-arrivals">
          <div className="arrivals-header">
            <h2>New Arrivals</h2>
            <Link href="/client/category-page" className="view-all-btn">View All</Link>
          </div>
          <div className="loading">Loading products...</div>
        </section>
      );
    }

    if (error) {
      return (
        <section className="new-arrivals">
          <div className="arrivals-header">
            <h2>New Arrivals</h2>
            <Link href="/client/category-page" className="view-all-btn">View All</Link>
          </div>
          <div className="error">Error: {error}</div>
        </section>
      );
    }

    return (
      <section className="new-arrivals">
        <div className="arrivals-header">
          <h2>New Arrivals</h2>
          <Link href="/client/category-page" className="view-all-btn">View All</Link>
        </div>
        <div className="arrivals-container">
          {products.map((product) => (
            <div key={product.id} className="new-arrivals-products">
              <img src={product.image} alt={product.name} loading="lazy" />
              <div className="arrivals-content">
                <div className="product-header">
                  <p className="name">{product.brand}</p>
                  <div className="product-actions">
                    <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 17.541C11 17.541 1.625 12.291 1.625 5.91602C1.62519 4.78927 2.01561 3.69737 2.72989 2.82594C3.44416 1.95452 4.4382 1.35738 5.54299 1.13603C6.64778 0.914685 7.79514 1.0828 8.78999 1.6118C9.78484 2.1408 10.5658 2.99803 11 4.03774L11 4.03775C11.4342 2.99804 12.2152 2.14081 13.21 1.61181C14.2049 1.08281 15.3522 0.914686 16.457 1.13603C17.5618 1.35737 18.5558 1.95452 19.2701 3.53493C19.9844 3.69737 20.3748 4.78927 20.375 5.91602C20.375 12.291 11 17.541 11 17.541Z" stroke="#13101E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <svg
                      className="add-to-cart-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      onClick={() => this.addToCart(product)}
                    >
                      <g clipPath="url(#clip0_cart)">
                        <path d="M19.5787 6.75H4.42122C4.23665 6.75 4.05856 6.81806 3.92103 6.94115C3.7835 7.06425 3.69619 7.23373 3.67581 7.41718L2.34248 19.4172C2.33083 19.522 2.34143 19.6281 2.37357 19.7286C2.40572 19.829 2.4587 19.9216 2.52904 20.0002C2.59939 20.0788 2.68553 20.1417 2.78182 20.1847C2.87812 20.2278 2.98241 20.25 3.08789 20.25H20.912C21.0175 20.25 21.1218 20.2278 21.2181 20.1847C21.3144 20.1417 21.4005 20.0788 21.4708 20.0002C21.5412 19.9216 21.5942 19.829 21.6263 19.7286C21.6585 19.6281 21.6691 19.522 21.6574 19.4172L20.3241 7.41718C20.3037 7.23373 20.2164 7.06425 20.0789 6.94115C19.9413 6.81806 19.7632 6.75 19.5787 6.75Z" stroke="#13101E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.25 5.75C8.25 4.75544 8.64509 3.80161 9.34835 3.09835C10.0516 2.39509 11.0054 2 12 2C12.9946 2 13.9484 2.39509 14.6517 3.09835C15.3549 3.80161 15.75 4.75544 15.75 5.75" stroke="#13101E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_cart">
                          <rect width="24" height="24" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </div>
                <p className="description">{product.name}</p>
                <ins>${product.price.toFixed(2)}</ins>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
}

export default BestSelling;