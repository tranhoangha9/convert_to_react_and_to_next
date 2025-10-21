"use client";
import React, { Component } from "react";
import "./category-page.css";

class CategoryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      loading: true,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 9,
      },
      filters: {
        color: {
          expanded: true,
          options: [
            { name: "Blue", checked: false },
            { name: "Maroon Red", checked: false },
            { name: "Crimson Red", checked: true },
            { name: "Seinna Pink", checked: false },
            { name: "Teal", checked: false },
            { name: "Aquamarine", checked: false },
            { name: "Off-White", checked: false },
            { name: "Mauve Orange", checked: false },
          ],
        },
        size: { expanded: false },
        brand: { expanded: false },
        price: { expanded: false },
        discount: { expanded: false },
        availability: { expanded: false },
      },
      viewMode: "grid",
      sortBy: "position",
    };
  }

  async componentDidMount() {
    await this.fetchProducts();
  }

  fetchProducts = async (page = 1) => {
    try {
      this.setState({ loading: true });

      const response = await fetch(`/api/client/products?page=${page}&limit=9`);
      const data = await response.json();

      if (data.success) {
        this.setState({
          products: data.products,
          pagination: data.pagination,
          loading: false,
        });
      } else {
        console.error("Error fetching products:", data.error);
        this.setState({ loading: false });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      this.setState({ loading: false });
    }
  };

  handlePageChange = (page) => {
    this.fetchProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  addToCart = async (product) => {
    console.log('Adding to cart:', product);
    try {
      const { addToCart: addToCartService } = await import("@/lib/cartService");
      const success = await addToCartService(product, 1);

      console.log('Add to cart result:', success);

      if (success) {
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
      } else {
        alert("Có lỗi xảy ra khi thêm vào giỏ hàng!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Có lỗi xảy ra khi thêm vào giỏ hàng!");
    }
  };

  toggleFilter = (filterName) => {
    this.setState((prevState) => ({
      filters: {
        ...prevState.filters,
        [filterName]: {
          ...prevState.filters[filterName],
          expanded: !prevState.filters[filterName].expanded,
        },
      },
    }));
  };

  toggleColorFilter = (colorName) => {
    this.setState((prevState) => ({
      filters: {
        ...prevState.filters,
        color: {
          ...prevState.filters.color,
          options: prevState.filters.color.options.map((option) =>
            option.name === colorName
              ? { ...option, checked: !option.checked }
              : option
          ),
        },
      },
    }));
  };

  toggleWishlist = (productId) => {
    this.setState((prevState) => ({
      products: prevState.products.map((product) =>
        product.id === productId
          ? { ...product, isWishlisted: !product.isWishlisted }
          : product
      ),
    }));
  };

  render() {
    const { products, filters, viewMode, sortBy, loading, pagination } =
      this.state;

    return (
      <div className="cp-category-page">
        <div className="cp-promo-banner">
          <div className="cp-promo-content">
            <div className="cp-promo-image">
              <img src="/assets/images/banner_cate.png" alt="Black Friday" loading="lazy" />
            </div>
            <div className="cp-promo-text">
              <h2>UPTO 70% OFF</h2>
              <h3>BLACK FRIDAY</h3>
            </div>
          </div>
        </div>

        <div className="cp-page-content">
          <div className="cp-breadcrumb">
            <span>Home</span>
            <span className="cp-separator"> &gt; </span>
            <span>Handbag</span>
          </div>

          <h1 className="cp-page-title">Handbags</h1>

          <div className="cp-main-layout">
            <div className="cp-sidebar">
              <div className="cp-filter-section">
                <div
                  className="cp-filter-header"
                  onClick={() => this.toggleFilter("size")}
                >
                  <h3>Size</h3>
                  <span className="cp-expand-icon">
                    {filters.size.expanded ? "−" : "+"}
                  </span>
                </div>
              </div>

              <div className="cp-filter-section">
                <div
                  className="cp-filter-header"
                  onClick={() => this.toggleFilter("color")}
                >
                  <h3>Color</h3>
                  <span className="cp-expand-icon">
                    {filters.color.expanded ? "−" : "+"}
                  </span>
                </div>
                {filters.color.expanded && (
                  <div className="cp-filter-options">
                    {filters.color.options.map((option, index) => (
                      <label key={index} className="cp-filter-option">
                        <input
                          type="checkbox"
                          checked={option.checked}
                          onChange={() => this.toggleColorFilter(option.name)}
                        />
                        <span>{option.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="cp-filter-section">
                <div
                  className="cp-filter-header"
                  onClick={() => this.toggleFilter("brand")}
                >
                  <h3>Brand</h3>
                  <span className="cp-expand-icon">
                    {filters.brand.expanded ? "−" : "+"}
                  </span>
                </div>
              </div>

              <div className="cp-filter-section">
                <div
                  className="cp-filter-header"
                  onClick={() => this.toggleFilter("price")}
                >
                  <h3>Price Range</h3>
                  <span className="cp-expand-icon">
                    {filters.price.expanded ? "−" : "+"}
                  </span>
                </div>
              </div>

              <div className="cp-filter-section">
                <div
                  className="cp-filter-header"
                  onClick={() => this.toggleFilter("discount")}
                >
                  <h3>Discount</h3>
                  <span className="cp-expand-icon">
                    {filters.discount.expanded ? "−" : "+"}
                  </span>
                </div>
              </div>

              <div className="cp-filter-section">
                <div
                  className="cp-filter-header"
                  onClick={() => this.toggleFilter("availability")}
                >
                  <h3>Availability</h3>
                  <span className="cp-expand-icon">
                    {filters.availability.expanded ? "−" : "+"}
                  </span>
                </div>
              </div>
            </div>

            <div className="cp-main-content">
              <div className="cp-content-header">
                <div className="cp-display-controls">
                  <div className="cp-view-toggle">
                    <button
                      className={`cp-view-btn ${
                        viewMode === "grid" ? "cp-active" : ""
                      }`}
                      onClick={() => this.setState({ viewMode: "grid" })}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="24" height="24" fill="none" />
                        <path
                          d="M3.25 4.5C3.25 4.16848 3.3817 3.85054 3.61612 3.61612C3.85054 3.3817 4.16848 3.25 4.5 3.25H7C7.33152 3.25 7.64946 3.3817 7.88388 3.61612C8.1183 3.85054 8.25 4.16848 8.25 4.5V7C8.25 7.33152 8.1183 7.64946 7.88388 7.88388C7.64946 8.1183 7.33152 8.25 7 8.25H4.5C4.16848 8.25 3.85054 8.1183 3.61612 7.88388C3.3817 7.64946 3.25 7.33152 3.25 7V4.5ZM9.5 4.5C9.5 4.16848 9.6317 3.85054 9.86612 3.61612C10.1005 3.3817 10.4185 3.25 10.75 3.25H13.25C13.5815 3.25 13.8995 3.3817 14.1339 3.61612C14.3683 3.85054 14.5 4.16848 14.5 4.5V7C14.5 7.33152 14.3683 7.64946 14.1339 7.88388C13.8995 8.1183 13.5815 8.25 13.25 8.25H10.75C10.4185 8.25 10.1005 8.1183 9.86612 7.88388C9.6317 7.64946 9.5 7.33152 9.5 7V4.5ZM15.75 4.5C15.75 4.16848 15.8817 3.85054 16.1161 3.61612C16.3505 3.3817 16.6685 3.25 17 3.25H19.5C19.8315 3.25 20.1495 3.3817 20.3839 3.61612C20.6183 3.85054 20.75 4.16848 20.75 4.5V7C20.75 7.33152 20.6183 7.64946 20.3839 7.88388C20.1495 8.1183 19.8315 8.25 19.5 8.25H17C16.6685 8.25 16.3505 8.1183 16.1161 7.88388C15.8817 7.64946 15.75 7.33152 15.75 7V4.5ZM3.25 10.75C3.25 10.4185 3.3817 10.1005 3.61612 9.86612C3.85054 9.6317 4.16848 9.5 4.5 9.5H7C7.33152 9.5 7.64946 9.6317 7.88388 9.86612C8.1183 10.1005 8.25 10.4185 8.25 10.75V13.25C8.25 13.5815 8.1183 13.8995 7.88388 14.1339C7.64946 14.3683 7.33152 14.5 7 14.5H4.5C4.16848 14.5 3.85054 14.3683 3.61612 14.1339C3.3817 13.8995 3.25 13.5815 3.25 13.25V10.75ZM9.5 10.75C9.5 10.4185 9.6317 10.1005 9.86612 9.86612C10.1005 9.6317 10.4185 9.5 10.75 9.5H13.25C13.5815 9.5 13.8995 9.6317 14.1339 9.86612C14.3683 10.1005 14.5 10.4185 14.5 10.75V13.25C14.5 13.5815 14.3683 13.8995 14.1339 14.1339C13.8995 14.3683 13.5815 14.5 13.25 14.5H10.75C10.4185 14.5 10.1005 14.3683 9.86612 14.1339C9.6317 13.8995 9.5 13.5815 9.5 13.25V10.75ZM15.75 10.75C15.75 10.4185 15.8817 10.1005 16.1161 9.86612C16.3505 9.6317 16.6685 9.5 17 9.5H19.5C19.8315 9.5 20.1495 9.6317 20.3839 9.86612C20.6183 10.1005 20.75 10.4185 20.75 10.75V13.25C20.75 13.5815 20.6183 13.8995 20.3839 14.1339C20.1495 14.3683 19.8315 14.5 19.5 14.5H17C16.6685 14.5 16.3505 14.3683 16.1161 14.1339C15.8817 13.8995 15.75 13.5815 15.75 13.25V10.75ZM3.25 17C3.25 16.6685 3.3817 16.3505 3.61612 16.1161C3.85054 15.8817 4.16848 15.75 4.5 15.75H7C7.33152 15.75 7.64946 15.8817 7.88388 16.1161C8.1183 16.3505 8.25 16.6685 8.25 17V19.5C8.25 19.8315 8.1183 20.1495 7.88388 20.3839C7.64946 20.6183 7.33152 20.75 7 20.75H4.5C4.16848 20.75 3.85054 20.6183 3.61612 20.3839C3.3817 20.1495 3.25 19.8315 3.25 19.5V17ZM9.5 17C9.5 16.6685 9.6317 16.3505 9.86612 16.1161C10.1005 15.8817 10.4185 15.75 10.75 15.75H13.25C13.5815 15.75 13.8995 15.8817 14.1339 16.1161C14.3683 16.3505 14.5 16.6685 14.5 17V19.5C14.5 19.8315 14.3683 20.1495 14.1339 20.3839C13.8995 20.6183 13.5815 20.75 13.25 20.75H10.75C10.4185 20.75 10.1005 20.6183 9.86612 20.3839C9.6317 20.1495 9.5 19.8315 9.5 19.5V17ZM15.75 17C15.75 16.6685 15.8817 16.3505 16.1161 16.1161C16.3505 15.8817 16.6685 15.75 17 15.75H19.5C19.8315 15.75 20.1495 15.8817 20.3839 16.1161C20.6183 16.3505 20.75 16.6685 20.75 17V19.5C20.75 19.8315 20.6183 20.1495 20.3839 20.3839C20.1495 20.6183 19.8315 20.75 19.5 20.75H17C16.6685 20.75 16.3505 20.6183 16.1161 20.3839C15.8817 20.1495 15.75 19.8315 15.75 19.5V17Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button
                      className={`cp-view-btn ${
                        viewMode === "list" ? "cp-active" : ""
                      }`}
                      onClick={() => this.setState({ viewMode: "list" })}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="4.44444"
                          height="4.57143"
                          fill="currentColor"
                        />
                        <rect
                          x="2"
                          y="9.71436"
                          width="4.44444"
                          height="4.57143"
                          fill="currentColor"
                        />
                        <rect
                          x="2"
                          y="15.4287"
                          width="4.44444"
                          height="4.57143"
                          fill="currentColor"
                        />
                        <rect
                          x="7.55554"
                          y="4"
                          width="14.4444"
                          height="4.57143"
                         fill="currentColor"
                        />
                        <rect
                          x="7.55554"
                          y="9.71436"
                          width="14.4444"
                          height="4.57143"
                         fill="currentColor"
                        />
                        <rect
                          x="7.55554"
                          y="15.4287"
                          width="14.4444"
                          height="4.57143"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                  <span className="cp-item-count">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.limit + 1}-
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalCount
                    )}{" "}
                    of {pagination.totalCount} items
                  </span>
                </div>

                <div className="cp-sort-controls">
                  <select
                    className="cp-select"
                    value={sortBy}
                    onChange={(e) => this.setState({ sortBy: e.target.value })}
                  >
                    <option value="position">Sort By: Position</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="cp-loading">Loading...</div>
              ) : (
                <div
                  className={`cp-products-grid ${
                    viewMode === "list" ? "cp-list-view" : ""
                  }`}
                >
                  {products.map((product) => (
                    <div key={product.id} className="cp-product-card">
                      <div className="cp-product-image">
                        <img src={product.image} alt={product.name} loading="lazy" />
                      </div>
                      <div className="cp-product-info">
                        <div className="cp-product-header">
                          <div className="cp-product-brand">
                            {product.brand}
                          </div>
                          <div className="cp-product-actions">
                            <button
                              className="cp-cart-btn"
                              onClick={() => this.addToCart(product)}
                              title="Add to cart"
                              aria-label={`Add ${product.name} to cart`}
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clipPath="url(#clip0_cart)">
                                  <path
                                    d="M19.5787 6.75H4.42122C4.23665 6.75 4.05856 6.81806 3.92103 6.94115C3.7835 7.06425 3.69619 7.23373 3.67581 7.41718L2.34248 19.4172C2.33083 19.522 2.34143 19.6281 2.37357 19.7286C2.40572 19.829 2.4587 19.9216 2.52904 20.0002C2.59939 20.0788 2.68553 20.1417 2.78182 20.1847C2.87812 20.2278 2.98241 20.25 3.08789 20.25H20.912C21.0175 20.25 21.1218 20.2278 21.2181 20.1847C21.3144 20.1417 21.4005 20.0788 21.4708 20.0002C21.5412 19.9216 21.5942 19.829 21.6263 19.7286C21.6585 19.6281 21.6691 19.522 21.6574 19.4172L20.3241 7.41718C20.3037 7.23373 20.2164 7.06425 20.0789 6.94115C19.9413 6.81806 19.7632 6.75 19.5787 6.75Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M8.25 5.75C8.25 4.75544 8.64509 3.80161 9.34835 3.09835C10.0516 2.39509 11.0054 2 12 2C12.9946 2 13.9484 2.39509 14.6517 3.09835C15.3549 3.80161 15.75 4.75544 15.75 5.75"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_cart">
                                    <rect width="24" height="24" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </button>
                            <button
                              className={`cp-wishlist-btn ${
                                product.isWishlisted ? "cp-wishlisted" : ""
                              }`}
                              onClick={() => this.toggleWishlist(product.id)}
                              aria-label={`${product.isWishlisted ? 'Remove from' : 'Add to'} wishlist`}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 20.25C12 20.25 2.625 15 2.625 8.62501C2.62519 7.49826 3.01561 6.40635 3.72989 5.53493C4.44416 4.66351 5.4382 4.06636 6.54299 3.84501C7.64778 3.62367 8.79514 3.79179 9.78999 4.32079C10.7848 4.84979 11.5658 5.70702 12 6.74673L12 6.74673C12.4342 5.70702 13.2152 4.84979 14.21 4.32079C15.2049 3.79179 16.3522 3.62367 17.457 3.84501C18.5618 4.06636 19.5558 4.66351 20.2701 5.53493C20.9844 6.40635 21.3748 7.49826 21.375 8.62501C21.375 15 12 20.25 12 20.25Z"
                                  stroke="currentColor"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="cp-product-name">{product.name}</div>
                        <div className="cp-product-rating">
                          <div className="cp-stars">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill={
                                  i < product.rating ? "#FFB800" : "#E5E5E5"
                                }
                              >
                                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                              </svg>
                            ))}
                          </div>
                          <span className="cp-rating-count">
                            {product.reviews} Ratings
                          </span>
                        </div>
                        <div className="cp-product-price">
                          <ins className="cp-current-price">
                            ${product.price.toFixed(2)}
                          </ins>
                          {product.originalPrice && (
                            <span className="cp-original-price">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                          {product.discount > 0 && (
                            <span className="cp-discount-tag">
                              {product.discount}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && pagination.totalPages > 1 && (
                <div className="cp-pagination">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      className={`cp-page-btn ${
                        pagination.currentPage === page ? "cp-active" : ""
                      }`}
                      onClick={() => this.handlePageChange(page)}
                      aria-label={`Go to page ${page}`}
                    >
                      {page}
                    </button>
                  ))}
                  {pagination.hasNext && (
                    <button
                      className="cp-page-btn cp-next"
                      onClick={() =>
                        this.handlePageChange(pagination.currentPage + 1)
                      }
                      aria-label="Go to next page"
                    >
                      Next
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CategoryPage;
