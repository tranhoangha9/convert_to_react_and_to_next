'use client';
import React, { Component } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import './category.css';

function CategoryPageWrapper() {
  const params = useParams();
  return <CategoryPage slug={params.slug} />;
}

class CategoryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      loading: true,
      categoryName: '',
      hasProducts: false
    };
  }

  async componentDidMount() {
    await this.fetchProducts();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.slug !== this.props.slug) {
      await this.fetchProducts();
    }
  }

  fetchProducts = async () => {
    try {
      this.setState({ loading: true });
      const { slug } = this.props;
      
      const categoryNames = {
        'handbags': 'Handbags',
        'watches': 'Watches',
        'skincare': 'Skincare',
        'jewellery': 'Jewellery',
        'apparels': 'Apparels'
      };

      const response = await fetch(`/api/products?category=${slug}`);
      const data = await response.json();

      if (data.success && data.products.length > 0) {
        this.setState({
          products: data.products,
          categoryName: categoryNames[slug] || slug,
          hasProducts: true,
          loading: false
        });
      } else {
        this.setState({
          products: [],
          categoryName: categoryNames[slug] || slug,
          hasProducts: false,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      this.setState({ loading: false, hasProducts: false });
    }
  };

  render() {
    const { products, loading, categoryName, hasProducts } = this.state;

    if (loading) {
      return (
        <div className="category-page">
          <div className="container">
            <div className="loading-spinner">Loading products...</div>
          </div>
        </div>
      );
    }

    if (!hasProducts) {
      return (
        <div className="category-page">
          <div className="container">
            <div className="category-header">
              <h1>{categoryName}</h1>
            </div>
            <div className="empty-category">
              <div className="empty-icon">📦</div>
              <h2>Products Coming Soon</h2>
              <p>This category is currently being stocked. We apologize for the inconvenience.</p>
              <p>Please check out our other products:</p>
              <Link href="/client/category/handbags" className="view-handbags-btn">
                View Handbags Collection
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="category-page">
        <div className="container">
          <div className="category-header">
            <h1>{categoryName}</h1>
            <p>{products.length} products found</p>
          </div>
          
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image || '/assets/images/placeholder.jpg'} alt={product.name} />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">${product.price}</p>
                  <button className="add-to-cart-btn">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default CategoryPageWrapper;
