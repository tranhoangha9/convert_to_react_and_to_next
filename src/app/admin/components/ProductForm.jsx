'use client';
import React, { Component } from 'react';

class ProductForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        name: '',
        price: '',
        originalPrice: '',
        description: '',
        shortDescription: '',
        image: '',
        sku: '',
        stock: 0,
        categoryId: 1,
        isActive: true,
        isFeatured: false,
        imagePreview: ''
      }
    };

    this.imageInputRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.editingProduct !== this.props.editingProduct) {
      if (this.props.editingProduct) {
        this.setState({
          formData: {
            name: this.props.editingProduct.name || '',
            price: this.props.editingProduct.price || '',
            originalPrice: this.props.editingProduct.originalPrice || '',
            description: this.props.editingProduct.description || '',
            shortDescription: this.props.editingProduct.shortDescription || '',
            image: this.props.editingProduct.image || '',
            sku: this.props.editingProduct.sku || '',
            stock: this.props.editingProduct.stock || 0,
            categoryId: this.props.editingProduct.categoryId || 1,
            isActive: this.props.editingProduct.isActive !== undefined ? this.props.editingProduct.isActive : true,
            isFeatured: this.props.editingProduct.isFeatured || false,
            imagePreview: this.props.editingProduct.image || ''
          }
        });
      } else {
        this.setState({
          formData: {
            name: '',
            price: '',
            originalPrice: '',
            description: '',
            shortDescription: '',
            image: '',
            sku: '',
            stock: 0,
            categoryId: 1,
            isActive: true,
            isFeatured: false,
            imagePreview: ''
          }
        });
        if (this.imageInputRef.current) {
          this.imageInputRef.current.value = '';
        }
      }
    }
  }

  handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          imagePreview: e.target.result
        }
      }));
    };
    reader.readAsDataURL(file);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (data.success) {
        this.setState(prevState => ({
          formData: {
            ...prevState.formData,
            image: data.imageUrl
          }
        }));
      } else {
        alert('Lỗi khi upload ảnh: ' + data.error);
        this.setState(prevState => ({
          formData: {
            ...prevState.formData,
            imagePreview: ''
          }
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Lỗi khi upload ảnh');
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          imagePreview: ''
        }
      }));
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.state.formData, this.props.editingProduct);
  };

  handleCancel = () => {
    this.setState({
      formData: {
        name: '',
        price: '',
        originalPrice: '',
        description: '',
        shortDescription: '',
        image: '',
        sku: '',
        stock: 0,
        categoryId: 1,
        isActive: true,
        isFeatured: false,
        imagePreview: ''
      }
    });
    if (this.imageInputRef.current) {
      this.imageInputRef.current.value = '';
    }
    this.props.onCancel();
  };

  render() {
    const { categories, loading } = this.props;
    const { formData } = this.state;

    return (
      <div className="admin-card product-form-card">
        <h3>{this.props.editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={this.handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                name="categoryId"
                value={formData.categoryId || ''}
                onChange={this.handleInputChange}
                disabled={categories.length === 0}
              >
                <option value="">Select category</option>
                {categories.length === 0 ? (
                  <option value="" disabled>Cannot load categories</option>
                ) : (
                  categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={this.handleInputChange}
                placeholder="Enter SKU code"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={this.handleInputChange}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={this.handleInputChange}
                placeholder="Nhập giá"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>Giá gốc</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={this.handleInputChange}
                placeholder="Nhập giá gốc"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Số lượng</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={this.handleInputChange}
                placeholder="Nhập số lượng"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hoặc tải lên hình ảnh</label>
              <input
                type="file"
                name="imageFile"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={this.handleImageUpload}
                ref={this.imageInputRef}
              />
              {formData.imagePreview && (
                <div className="image-preview">
                  <img src={formData.imagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <div className="form-group">
              <label>URL hình ảnh</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={this.handleInputChange}
                placeholder="Nhập URL hình ảnh"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả ngắn</label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={this.handleInputChange}
              placeholder="Nhập mô tả ngắn"
            />
          </div>

          <div className="form-group">
            <label>Mô tả chi tiết</label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={this.handleInputChange}
              placeholder="Nhập mô tả chi tiết"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={this.handleInputChange}
                />
                <span>Kích hoạt</span>
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={this.handleInputChange}
                />
                <span>Nổi bật</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="admin-btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (this.props.editingProduct ? 'Update Product' : 'Save Product')}
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default ProductForm;
