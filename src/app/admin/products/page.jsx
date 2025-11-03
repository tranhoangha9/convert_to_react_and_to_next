'use client';
import React, { Component } from 'react';
import '../styles/admin.css';
import './product.css';
import AdminSidebar from '../components/AdminSidebar';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';
import AuthGuard from '../components/AuthGuard';

class AdminProducts extends Component {
    constructor(props) {
    super(props);
    this.state = {
      categories: [],
      products: [],
      loading: false,
      showForm: false,
      editingProduct: null,
      searchTerm: ''
    };
    this.searchTimeout = null;
  }

  async componentDidMount() {
    await Promise.all([
      this.fetchProducts(),
      this.fetchCategories()
    ]);
  }

  fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();

      if (data.success) {
        this.setState({ categories: data.categories });
      } else {
        console.error('Error fetching categories:', data.error);
        this.setState({ categories: [] });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      this.setState({ categories: [] });
    }
  };

  fetchProducts = async (fromSearch = false) => {
    try {
      if (!fromSearch) {
        this.setState({ loading: true });
      }
      const { searchTerm } = this.state;
      let url = '/api/admin/products';
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        this.setState({ products: data.products });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error loading products');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSubmit = async (formData, editingProduct) => {
    try {
      this.setState({ loading: true });

      const url = '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct
        ? { ...formData, id: editingProduct.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Product saved successfully');
        this.setState({ showForm: false, editingProduct: null });
        await this.fetchProducts();
      } else {
        alert(data.error || 'Error saving product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleEdit = (product) => {
    this.setState({ editingProduct: null, showForm: true }, () => {
      setTimeout(() => {
        this.setState({ editingProduct: product });
      }, 0);
    });
  };

  handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this product?')) return;

    try {
      this.setState({ loading: true });
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: false })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Product deactivated successfully');
        await this.fetchProducts();
      } else {
        alert(data.error || 'Error deactivating product');
      }
    } catch (error) {
      console.error('Error deactivating product:', error);
      alert('Error deactivating product');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleActivate = async (id) => {
    if (!confirm('Are you sure you want to activate this product?')) return;

    try {
      this.setState({ loading: true });
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: true })
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || 'Product activated successfully');
        await this.fetchProducts();
      } else {
        alert(data.error || 'Error activating product');
      }
    } catch (error) {
      console.error('Error activating product:', error);
      alert('Error activating product');
    } finally {
      this.setState({ loading: false });
    }
  };

  toggleForm = () => {
    this.setState(prevState => ({
      showForm: !prevState.showForm
    }));
    if (this.state.showForm) {
      this.setState({ editingProduct: null });
    }
  };

  handleSearchChange = (e) => {
    const value = e.target.value;
    this.setState({ searchTerm: value });

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.fetchProducts(true);
    }, 500);
  };

  render() {
    const { categories, products, loading, showForm, editingProduct, searchTerm } = this.state;

    if (loading && !showForm) {
      return (
        <AuthGuard>
          <div className="admin-container">
            <AdminSidebar currentPath="/admin/products" />
            <div className="admin-content">
              <div className="loading-spinner">Loading products...</div>
            </div>
          </div>
        </AuthGuard>
      );
    }

    return (
      <AuthGuard>
        <div className="admin-container">
        <AdminSidebar currentPath="/admin/products" />
        <div className="admin-content product-page">
          {showForm && (
            <ProductForm
              categories={categories}
              onSubmit={this.handleSubmit}
              onCancel={() => {
                this.setState({ showForm: false, editingProduct: null });
              }}
              editingProduct={editingProduct}
              loading={loading}
            />
          )}

          <div className="products-controls">
            <div className="products-search-box">
              <input
                type="text"
                placeholder="Search by name, SKU, description..."
                value={searchTerm}
                onChange={this.handleSearchChange}
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          <div className="admin-card admin-card-with-margin">
            <div className="admin-card-header">
              <h3>Products List</h3>
              {showForm ? (
                <button className="btn-secondary" onClick={this.toggleForm}>
                  Close Form
                </button>
              ) : (
                <button className="admin-btn-primary" onClick={this.toggleForm}>
                  Add Product
                </button>
              )}
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th className="text-left">Product Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <ProductTable
                  products={products}
                  loading={loading}
                  onEdit={this.handleEdit}
                  onDelete={this.handleDelete}
                  onActivate={this.handleActivate}
                />
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </AuthGuard>
    );
  }
}

export default AdminProducts;
