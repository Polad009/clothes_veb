/**
 * Atelier Store Shopping Cart Module
 */

const Cart = {
  items: [],
  promo: null,

  init() {
    this.load();
    this.updateUI();
  },

  load() {
    try {
      const saved = localStorage.getItem('atelier_cart');
      this.items = saved ? JSON.parse(saved) : [];
      const savedPromo = localStorage.getItem('atelier_promo');
      this.promo = savedPromo ? JSON.parse(savedPromo) : null;
    } catch (e) {
      this.items = [];
    }
  },

  save() {
    localStorage.setItem('atelier_cart', JSON.stringify(this.items));
    if (this.promo) {
      localStorage.setItem('atelier_promo', JSON.stringify(this.promo));
    } else {
      localStorage.removeItem('atelier_promo');
    }
    this.updateUI();
  },

  addItem(product, options = {}) {
    const size = options.size || (product.sizes ? product.sizes[0] : 'L');
    const color = options.color || (product.colors ? product.colors[0].name : 'Default');
    const customDetails = options.customDetails || null;
    const price = options.price || product.price;

    const existingIndex = this.items.findIndex(item => 
      item.id === product.id && 
      item.size === size && 
      item.color === color &&
      JSON.stringify(item.customDetails) === JSON.stringify(customDetails)
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += (options.quantity || 1);
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: price,
        currency: "₼",
        silhouetteType: product.silhouetteType || "tshirt",
        silhouetteColor: product.silhouetteColor || "#222224",
        size: size,
        color: color,
        customDetails: customDetails,
        quantity: options.quantity || 1
      });
    }

    this.save();
    this.openDrawer();
    App.showToast(`"${product.name}" səbətə əlavə edildi.`);
  },

  updateQuantity(index, delta) {
    if (!this.items[index]) return;
    this.items[index].quantity += delta;
    if (this.items[index].quantity <= 0) {
      this.items.splice(index, 1);
    }
    this.save();
  },

  removeItem(index) {
    if (!this.items[index]) return;
    const name = this.items[index].name;
    this.items.splice(index, 1);
    this.save();
    App.showToast(`"${name}" silindi.`);
  },

  clear() {
    this.items = [];
    this.promo = null;
    this.save();
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getDiscount() {
    if (!this.promo) return 0;
    return this.promo.discount || 0;
  },

  getTotal() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    return Math.max(0, subtotal - discount);
  },

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  openDrawer() {
    const overlay = document.getElementById('cartDrawerOverlay');
    if (overlay) overlay.classList.add('open');
  },

  closeDrawer() {
    const overlay = document.getElementById('cartDrawerOverlay');
    if (overlay) overlay.classList.remove('open');
  },

  updateUI() {
    const count = this.getCount();
    
    // Header cart count
    const headerCount = document.getElementById('cartCountDisplay');
    if (headerCount) headerCount.textContent = count;

    const drawerCount = document.getElementById('drawerCartCount');
    if (drawerCount) drawerCount.textContent = count;

    const container = document.getElementById('cartItemsList');
    const subtotalEl = document.getElementById('cartSubtotalAmount');
    const totalEl = document.getElementById('cartTotalAmount');

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 40px 10px; color: var(--text-muted);">
          <p style="font-size: 0.95rem; color: #111; font-weight: 600; margin-bottom: 6px;">Səbətiniz boşdur</p>
          <p style="font-size: 0.85rem;">Kolleksiyadan bəyəndiyiniz modeli seçin.</p>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '0 ₼';
      if (totalEl) totalEl.textContent = '0 ₼';
      return;
    }

    container.innerHTML = this.items.map((item, index) => {
      const svg = Store.getGarmentSvg(item.silhouetteType, item.silhouetteColor);
      return `
        <div style="display: flex; gap: 14px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
          <div style="width: 60px; height: 70px; background: var(--bg-card); border-radius: 6px; display: flex; align-items: center; justify-content: center; padding: 6px;">
            ${svg}
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 0.9rem;">${item.name}</div>
            <div style="font-size: 0.8rem; color: #888;">${item.size} • ${item.color}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
              <div style="display: flex; gap: 8px; align-items: center;">
                <button onclick="Cart.updateQuantity(${index}, -1)" style="border:1px solid #ddd; width:22px; height:22px; border-radius:4px;">-</button>
                <span style="font-size: 0.85rem; font-weight: 600;">${item.quantity}</span>
                <button onclick="Cart.updateQuantity(${index}, 1)" style="border:1px solid #ddd; width:22px; height:22px; border-radius:4px;">+</button>
              </div>
              <div style="font-weight: 700; font-size: 0.95rem;">${item.price * item.quantity} ₼</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const subtotal = this.getSubtotal();
    const total = this.getTotal();

    if (subtotalEl) subtotalEl.textContent = `${subtotal} ₼`;
    if (totalEl) totalEl.textContent = `${total} ₼`;
  }
};
