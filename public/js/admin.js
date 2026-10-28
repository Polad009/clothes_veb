/**
 * Atelier Store Admin Dashboard Module
 */

const Admin = {
  currentTab: 'products', // products, orders

  async init() {
    await this.fetchStats();
    this.renderActiveTab();
  },

  async fetchStats() {
    try {
      const res = await API.getAdminStats();
      if (res.success && res.data) {
        const d = res.data;
        const revEl = document.getElementById('adminStatRevenue');
        const ordEl = document.getElementById('adminStatOrders');
        const prodEl = document.getElementById('adminStatProducts');
        const pendEl = document.getElementById('adminStatPending');

        if (revEl) revEl.textContent = `${d.totalRevenue} AZN`;
        if (ordEl) ordEl.textContent = d.totalOrders;
        if (prodEl) prodEl.textContent = d.activeProducts;
        if (pendEl) pendEl.textContent = d.pendingOrders;
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  },

  setTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll('.admin-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });
    this.renderActiveTab();
  },

  async renderActiveTab() {
    const container = document.getElementById('adminTabContentArea');
    if (!container) return;

    if (this.currentTab === 'products') {
      await this.renderProductsTab(container);
    } else {
      await this.renderOrdersTab(container);
    }
  },

  async renderProductsTab(container) {
    const res = await API.getProducts();
    const products = res.success ? res.data : [];

    container.innerHTML = `
      <div class="admin-table-card">
        <div class="table-header-toolbar">
          <h4 style="font-family: var(--font-serif); font-size: 1.3rem;">Məhsul Kataloqu (${products.length})</h4>
          <div style="display: flex; gap: 12px;">
            <button class="btn-primary" style="padding: 8px 18px; font-size: 0.8rem;" onclick="Admin.openNewProductModal()">
              + Yeni Məhsul Əlavə Et
            </button>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Məhsul</th>
              <th>Kateqoriya</th>
              <th>Qiymət</th>
              <th>Material</th>
              <th>Reytinq</th>
              <th>Stok</th>
              <th style="text-align: right;">Əməliyyat</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td>
                  <div class="table-prod-cell">
                    <img src="${p.image}" alt="${p.name}">
                    <div>
                      <strong>${p.name}</strong>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${p.id}</div>
                    </div>
                  </div>
                </td>
                <td><span class="badge-status active">${p.category}</span></td>
                <td><strong>${p.price} ${p.currency}</strong></td>
                <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.material}</td>
                <td>★ ${p.rating} (${p.reviewsCount || 0})</td>
                <td>${p.stock || 10} ədəd</td>
                <td style="text-align: right;">
                  <div class="action-btn-group" style="justify-content: flex-end;">
                    <button class="btn-icon-sm" title="Baxış" onclick="Store.openQuickView('${p.id}')">
                      <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    <button class="btn-icon-sm delete" title="Sil" onclick="Admin.deleteProduct('${p.id}')">
                      <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  async renderOrdersTab(container) {
    const res = await API.getOrders();
    const orders = res.success ? res.data : [];

    container.innerHTML = `
      <div class="admin-table-card">
        <div class="table-header-toolbar">
          <h4 style="font-family: var(--font-serif); font-size: 1.3rem;">Gələn Sifarişlər (${orders.length})</h4>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Sifariş ID</th>
              <th>Tarix</th>
              <th>Müştəri</th>
              <th>Məbləğ</th>
              <th>Ödəniş</th>
              <th>Status</th>
              <th style="text-align: right;">Statusu Yenilə</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>
                  <strong>${o.id}</strong>
                  <div style="font-size:0.72rem; color:var(--accent-gold); font-weight:600;">${o.trackingCode}</div>
                </td>
                <td>${new Date(o.createdAt).toLocaleDateString('az-AZ')}</td>
                <td>
                  <strong>${o.customer.fullName}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${o.customer.phone}</div>
                </td>
                <td><strong>${o.total} AZN</strong> (${o.items.length} məhsul)</td>
                <td><span class="badge-status ${o.paymentStatus === 'Ödənilib' ? 'active' : 'pending'}">${o.paymentStatus}</span></td>
                <td><span class="badge-status ${o.status === 'Çatdırıldı' ? 'delivered' : 'pending'}">${o.status}</span></td>
                <td style="text-align: right;">
                  <select onchange="Admin.changeOrderStatus('${o.id}', this.value)" style="padding: 6px 8px; font-size: 0.8rem; border: 1px solid var(--border-medium); border-radius: 4px; outline: none; background: #fff;">
                    <option value="Qəbul edildi & Hazırlanır" ${o.status.includes('Qəbul') ? 'selected' : ''}>Qəbul edildi</option>
                    <option value="Dərzidə hazırlanır" ${o.status.includes('Dərzidə') ? 'selected' : ''}>Dərzidə hazırlanır</option>
                    <option value="Çatdırılmada" ${o.status.includes('Çatdırılmada') ? 'selected' : ''}>Çatdırılmada</option>
                    <option value="Çatdırıldı" ${o.status.includes('Çatdırıldı') ? 'selected' : ''}>Çatdırıldı</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  async changeOrderStatus(orderId, status) {
    const res = await API.updateOrderStatus(orderId, status);
    if (res.success) {
      App.showToast(`Sifariş #${orderId} statusu "${status}" olaraq yeniləndi`);
      this.fetchStats();
      this.renderActiveTab();
    }
  },

  async deleteProduct(id) {
    if (!confirm('Bu məhsulu kataloqdan silmək istədiyinizə əminsiniz?')) return;
    const res = await API.deleteProduct(id);
    if (res.success) {
      App.showToast('Məhsul silindi');
      this.fetchStats();
      this.renderActiveTab();
      Store.fetchProducts();
    }
  },

  openNewProductModal() {
    const modal = document.getElementById('quickViewModal');
    const modalBody = document.getElementById('quickViewModalBody');

    modalBody.innerHTML = `
      <div style="padding: 36px;">
        <h2 style="font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 20px;">Yeni Lüks Məhsul Əlavə Et</h2>
        <form onsubmit="Admin.submitNewProduct(event)">
          <div class="form-grid-2">
            <div class="form-field">
              <label>Məhsulun Adı</label>
              <input type="text" id="newProdName" placeholder="məs. Zümrüd İpək Jakard Pencək" required>
            </div>
            <div class="form-field">
              <label>Kateqoriya</label>
              <select id="newProdCategory">
                <option value="Qadın">Qadın</option>
                <option value="Kişi">Kişi</option>
                <option value="Uniseks">Uniseks</option>
                <option value="Aksesuar">Aksesuar</option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-field">
              <label>Qiymət (AZN)</label>
              <input type="number" step="0.01" min="0" id="newProdPrice" placeholder="320" required>
            </div>
            <div class="form-field">
              <label>Əvvəlki Qiymət (Endirim varsa)</label>
              <input type="number" step="0.01" min="0" id="newProdOldPrice" placeholder="390">
            </div>
          </div>

          <div class="form-field" style="margin-bottom: 18px;">
            <label>Material & Tərkibi</label>
            <input type="text" id="newProdMaterial" placeholder="100% İtalyan Kətanı, Tut İpəyi" required>
          </div>

          <div class="form-field" style="margin-bottom: 18px;">
            <label>Təsvir</label>
            <textarea id="newProdDesc" rows="3" placeholder="Məhsul haqqında zərif izahat..." required></textarea>
          </div>

          <div class="form-field" style="margin-bottom: 24px;">
            <label>Şəkil URL (Unsplash / CDN)</label>
            <input type="url" id="newProdImg" placeholder="https://images.unsplash.com/photo-..." value="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80" required>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button type="button" class="btn-outline" onclick="Store.closeQuickView()">Ləğv et</button>
            <button type="submit" class="btn-primary">Məhsulu Yadda Saxla</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add('open');
  },

  async submitNewProduct(e) {
    e.preventDefault();
    const name = document.getElementById('newProdName').value;
    const category = document.getElementById('newProdCategory').value;
    const price = document.getElementById('newProdPrice').value;
    const oldPrice = document.getElementById('newProdOldPrice').value;
    const material = document.getElementById('newProdMaterial').value;
    const description = document.getElementById('newProdDesc').value;
    const image = document.getElementById('newProdImg').value;

    const res = await API.createProduct({
      name, category, price, oldPrice, material, description, image, isNew: true, isFeatured: true
    });

    if (res.success) {
      App.showToast('Yeni məhsul uğurla əlavə edildi!');
      Store.closeQuickView();
      this.fetchStats();
      this.renderActiveTab();
      Store.fetchProducts();
    }
  }
};
