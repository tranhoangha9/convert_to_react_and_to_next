'use client';
import React, { Component } from 'react';

class ProductTable extends Component {
  render() {
    const { products, loading, onEdit, onDelete, onActivate } = this.props;

    if (loading) {
      return (
        <tr>
          <td colSpan="7" className="loading-message">
            Loading...
          </td>
        </tr>
      );
    }

    if (products.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="empty-message">
            No products found
          </td>
        </tr>
      );
    }

    return (
      <>
        {products.map(product => (
          <tr key={product.id} className={product.isActive ? 'active-product' : 'inactive-product'}>
            <td className="text-center">{product.id}</td>
            <td className="text-center">
              {product.image && (
                <img src={product.image} alt={product.name} loading="lazy" />
              )}
            </td>
            <td>{product.name}</td>
            <td className="text-center">${parseFloat(product.price).toFixed(2)}</td>
            <td className="text-center">{product.stock}</td>
            <td className="text-center">
              <span className={`status-badge ${product.isActive ? 'status-active' : 'status-inactive'}`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="text-center">
              <div className="product-actions">
                <button
                  onClick={() => onEdit(product)}
                  className="btn-small btn-edit"
                >
                  Edit
                </button>
                {product.isActive ? (
                  <button
                    onClick={() => onDelete(product.id)}
                    className="btn-small btn-delete"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => onActivate(product.id)}
                    className="btn-small btn-activate"
                  >
                    Activate
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
