'use client';
import React, { Component } from 'react';

class ProductTable extends Component {
  render() {
    const { products, loading, onEdit, onDelete, onActivate } = this.props;

    if (loading) {
      return <div className="loading-message">Đang tải...</div>;
    }

    if (products.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="empty-message">
            Chưa có sản phẩm nào
          </td>
        </tr>
      );
    }

    return (
      <>
        {products.map(product => (
          <tr key={product.id} className={product.isActive ? 'active-product' : 'inactive-product'}>
            <td>{product.id}</td>
            <td>
              {product.image && (
                <img src={product.image} alt={product.name} loading="lazy" />
              )}
            </td>
            <td>{product.name}</td>
            <td>${parseFloat(product.price).toFixed(2)}</td>
            <td>{product.stock}</td>
            <td>
              <span className={`status-badge ${product.isActive ? 'status-active' : 'status-inactive'}`}>
                {product.isActive ? 'Hoạt động' : 'Tắt kích hoạt'}
              </span>
            </td>
            <td>
              <div className="product-actions">
                <button
                  onClick={() => onEdit(product)}
                  className="btn-small btn-edit"
                >
                  Sửa
                </button>
                {product.isActive ? (
                  <button
                    onClick={() => onDelete(product.id)}
                    className="btn-small btn-delete"
                  >
                    Tắt kích hoạt
                  </button>
                ) : (
                  <button
                    onClick={() => onActivate(product.id)}
                    className="btn-small btn-view"
                  >
                    Kích hoạt lại
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  }
}

export default ProductTable;
