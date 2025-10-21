'use client';
import React, { Component } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';

class AdminProducts extends Component {
    constructor(props) {
    super(props);
    this.state = {
      categories: [],
      products: [],
      loading: false,
      showForm: false,
      editingProduct: null
    };
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

  fetchProducts = async () => {
    try {
      this.setState({ loading: true });
      const response = await fetch('/api/admin/products');
      const data = await response.json();

      if (data.success) {
        this.setState({ products: data.products });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Lỗi khi tải danh sách sản phẩm');
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
        alert(data.message);
        this.setState({ showForm: false, editingProduct: null });
        await this.fetchProducts();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Lỗi khi lưu sản phẩm');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleEdit = (product) => {
    this.setState({
      editingProduct: product,
      showForm: true
    });
  };

  handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn tắt kích hoạt sản phẩm này? Sản phẩm sẽ không hiển thị ở trang khách hàng nhưng vẫn có thể kích hoạt lại.')) return;

    try {
      this.setState({ loading: true });
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: false })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        await this.fetchProducts();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deactivating product:', error);
      alert('Lỗi khi tắt kích hoạt sản phẩm');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleActivate = async (id) => {
    if (!confirm('Bạn có chắc muốn kích hoạt lại sản phẩm này?')) return;

    try {
      this.setState({ loading: true });
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: true })
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        await this.fetchProducts();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error activating product:', error);
      alert('Lỗi khi kích hoạt sản phẩm');
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

  render() {
    const { categories, products, loading, showForm, editingProduct } = this.state;

    if (loading && !showForm) {
      return (
        <div className="admin-container">
          <AdminSidebar currentPath="/admin/products" />
          <div className="admin-content">
            <div className="loading-spinner">Loading products...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-container">
        <AdminSidebar currentPath="/admin/products" />
        <div className="admin-content">
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

          <div className="admin-card admin-card-with-margin">
            <div className="admin-card-header">
              <h3>Danh sách sản phẩm</h3>
              {showForm ? (
                <button className="btn-secondary" onClick={this.toggleForm}>
                  Đóng form
                </button>
              ) : (
                <button className="admin-btn-primary" onClick={this.toggleForm}>
                  Thêm sản phẩm mới
                </button>
              )}
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
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
    );
  }
}

export default AdminProducts;
