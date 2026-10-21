/**
 * Atelier Store API Service
 * Handles all network requests to the Node.js backend
 */

const API_BASE = '/api';

const API = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${query}`);
    return await res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return await res.json();
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return await res.json();
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return await res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return await res.json();
  },

  // Studio
  async getStudioConfig() {
    const res = await fetch(`${API_BASE}/studio/config`);
    return await res.json();
  },

  async calculateStudioPrice(configData) {
    const res = await fetch(`${API_BASE}/studio/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    });
    return await res.json();
  },

  async saveCustomDesign(designData) {
    const res = await fetch(`${API_BASE}/studio/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(designData)
    });
    return await res.json();
  },

  // Promo
  async validatePromo(code, subtotal) {
    const res = await fetch(`${API_BASE}/promo/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    return await res.json();
  },

  // Orders
  async createOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return await res.json();
  },

  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    return await res.json();
  },

  async getOrder(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    return await res.json();
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  // Reviews
  async getReviews(productId) {
    const res = await fetch(`${API_BASE}/reviews/${productId}`);
    return await res.json();
  },

  async addReview(productId, reviewData) {
    const res = await fetch(`${API_BASE}/reviews/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return await res.json();
  },

  // Admin Stats
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`);
    return await res.json();
  }
};
