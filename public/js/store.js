/**
 * Atelier Store Catalog & Exact Product Detail Page Logic
 */

const Store = {
  products: [],
  activeCategory: 'all',
  currentProduct: null,
  selectedColorIndex: 0,
  selectedSize: 'M',
  currentViewMode: 'image', // 'image', '3d', 'model'

  init() {
    this.fetchProducts();
  },

  async fetchProducts() {
    try {
      const params = {};
      if (this.activeCategory !== 'all') params.category = this.activeCategory;

      const res = await API.getProducts(params);
      if (res.success) {
        this.products = res.data;
        this.renderFeaturedGrid();
        this.renderCatalogGrid();
        if (!this.currentProduct && this.products.length > 0) {
          this.currentProduct = this.products[0];
        }
      }
    } catch (err) {
      console.error('Error loading products:', err);
    }
  },

  setCategory(cat) {
    this.activeCategory = cat;
    this.fetchProducts();
    App.navigate('shop');
  },

  getGarmentSvg(type, color = '#E2E0DC') {
    if (type === 'hoodie') {
      return `
        <svg class="apparel-svg" viewBox="0 0 300 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M90 70 L30 150 L65 175 L95 125 L95 300 L205 300 L205 125 L235 175 L270 150 L210 70 Z" fill="${color}"/>
          <path d="M110 75 C110 35, 190 35, 190 75 C180 95, 120 95, 110 75 Z" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" opacity="0.9"/>
          <path d="M120 220 L180 220 L195 270 L105 270 Z" fill="${color}" opacity="0.85" stroke="rgba(0,0,0,0.06)" stroke-width="1.5"/>
        </svg>
      `;
    } else if (type === 'oversize') {
      return `
        <svg class="apparel-svg" viewBox="0 0 300 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M95 65 L20 155 L65 185 L95 130 L95 310 L205 310 L205 130 L235 185 L280 155 L205 65 Z" fill="${color}"/>
          <path d="M125 65 C135 80, 165 80, 175 65" stroke="rgba(255,255,255,0.2)" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    } else {
      // Classic & Essential T-Shirt
      return `
        <svg class="apparel-svg" viewBox="0 0 300 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 65 L35 140 L70 165 L100 120 L100 295 L200 295 L200 120 L230 165 L265 140 L200 65 Z" fill="${color}"/>
          <path d="M130 65 C138 78, 162 78, 170 65" stroke="rgba(0,0,0,0.08)" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    }
  },

  renderFeaturedGrid() {
    const container = document.getElementById('featuredProductsGrid');
    if (!container) return;

    const featuredList = this.products.filter(p => p.isFeatured || p.badge).slice(0, 4);
    const listToRender = featuredList.length > 0 ? featuredList : this.products.slice(0, 4);

    container.innerHTML = listToRender.map(p => {
      const img = p.image || (p.colors && p.colors[0] && p.colors[0].image);
      const mediaHtml = img
        ? `<img src="${img}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;" />`
        : this.getGarmentSvg(p.silhouetteType, p.silhouetteColor);

      return `
        <div class="minimal-card" onclick="window.location.href='http://localhost:3000/products/${p.slug || p.id}'">
          <div class="card-silhouette-box" style="overflow:hidden; background:#f4f1ea;">
            ${mediaHtml}
          </div>
          <div class="card-meta-row" style="margin-top:10px;">
            <span class="card-title" style="font-weight:600;">${p.name}</span>
            <span class="card-price" style="font-weight:700;">${p.price} ${p.currency || '₼'}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  renderCatalogGrid() {
    const container = document.getElementById('catalogProductsGrid');
    if (!container) return;

    container.innerHTML = this.products.map(p => {
      const img = p.image || (p.colors && p.colors[0] && p.colors[0].image);
      const mediaHtml = img
        ? `<img src="${img}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;" />`
        : this.getGarmentSvg(p.silhouetteType, p.silhouetteColor);

      return `
        <div class="minimal-card" onclick="window.location.href='http://localhost:3000/products/${p.slug || p.id}'">
          <div class="card-silhouette-box" style="overflow:hidden; background:#f4f1ea;">
            ${mediaHtml}
          </div>
          <div class="card-meta-row" style="margin-top:10px;">
            <span class="card-title" style="font-weight:600;">${p.name}</span>
            <span class="card-price" style="font-weight:700;">${p.price} ${p.currency || '₼'}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  getProduct(id) {
    return this.products.find(p => p.id === id);
  },

  // Məhsul Səhifəsini Açmaq (1-ci və 3-cü Şəkil)
  openProductPage(productId) {
    const product = this.getProduct(productId);
    if (!product) return;

    this.currentProduct = product;
    this.selectedColorIndex = 0;
    this.selectedSize = product.sizes.includes('M') ? 'M' : product.sizes[0];
    this.currentViewMode = 'image';

    this.renderProductPage();
    App.navigate('product');
  },

  setViewMode(mode) {
    this.currentViewMode = mode;
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    const canvasBox = document.getElementById('productMainCanvasBox');
    if (!canvasBox || !this.currentProduct) return;

    const currentColor = this.currentProduct.colors[this.selectedColorIndex] || this.currentProduct.colors[0];

    if (mode === '3d') {
      canvasBox.innerHTML = `
        <div style="text-align: center; width: 100%;">
          ${this.getGarmentSvg(this.currentProduct.silhouetteType, currentColor.silhouetteColor)}
          <div style="font-size: 0.78rem; color: #888; margin-top: 10px; letter-spacing: 0.05em;">3D İNTERAKTİV MODEL • 360°</div>
        </div>
      `;
    } else if (mode === 'model') {
      canvasBox.innerHTML = `
        <div style="text-align: center; width: 100%;">
          ${this.getGarmentSvg(this.currentProduct.silhouetteType, currentColor.silhouetteColor)}
          <div style="font-size: 0.78rem; color: #888; margin-top: 10px; letter-spacing: 0.05em;">MODEL ÜZƏRİNDƏ GÖRÜNÜŞ (BOY: 185 SM, ÖLÇÜ: L)</div>
        </div>
      `;
    } else {
      canvasBox.innerHTML = this.getGarmentSvg(this.currentProduct.silhouetteType, currentColor.silhouetteColor);
    }
  },

  selectProductColor(index) {
    this.selectedColorIndex = index;
    const currentColor = this.currentProduct.colors[index];

    // Update color circles
    document.querySelectorAll('.swatch-circle-btn').forEach((btn, i) => {
      btn.classList.toggle('selected', i === index);
    });

    // Update color text label
    const labelEl = document.getElementById('productColorLabel');
    if (labelEl) labelEl.textContent = currentColor.name;

    // Update main canvas and thumbnail active states
    this.setViewMode(this.currentViewMode);

    document.querySelectorAll('.thumb-silhouette-card').forEach((th, i) => {
      th.classList.toggle('active', i === index);
    });
  },

  selectProductSize(size) {
    this.selectedSize = size;
    document.querySelectorAll('.size-box-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.size === size);
    });
  },

  renderProductPage() {
    const p = this.currentProduct;
    if (!p) return;

    const currentColor = p.colors[this.selectedColorIndex] || p.colors[0];

    // 1. Rejim düymələri
    const modePillHtml = `
      <div class="view-mode-pill-bar">
        <button class="view-mode-btn ${this.currentViewMode === 'image' ? 'active' : ''}" data-mode="image" onclick="Store.setViewMode('image')">Şəkil</button>
        <button class="view-mode-btn ${this.currentViewMode === '3d' ? 'active' : ''}" data-mode="3d" onclick="Store.setViewMode('3d')">3D</button>
        <button class="view-mode-btn ${this.currentViewMode === 'model' ? 'active' : ''}" data-mode="model" onclick="Store.setViewMode('model')">Modeldə</button>
      </div>
    `;

    // 2. Əsas Böyük Siluet Qutusu
    const mainCanvasHtml = `
      <div class="product-main-canvas-box" id="productMainCanvasBox">
        ${this.getGarmentSvg(p.silhouetteType, currentColor.silhouetteColor)}
      </div>
    `;

    // 3. Miniatur Qutuları (3 ədəd yan-yana)
    const thumbsHtml = `
      <div class="product-thumbs-row">
        ${(p.colors || []).slice(0, 3).map((c, i) => `
          <div class="thumb-silhouette-card ${i === this.selectedColorIndex ? 'active' : ''}" onclick="Store.selectProductColor(${i})">
            ${this.getGarmentSvg(p.silhouetteType, c.silhouetteColor)}
          </div>
        `).join('')}
      </div>
    `;

    // 4. Rəng dairələri
    const colorSwatchesHtml = (p.colors || []).map((c, i) => `
      <button class="swatch-circle-btn ${i === this.selectedColorIndex ? 'selected' : ''}" onclick="Store.selectProductColor(${i})" title="${c.name}">
        <span style="background: ${c.hex};"></span>
      </button>
    `).join('');

    // 5. Ölçü qutuları
    const sizeBoxesHtml = (p.sizes || []).map(s => `
      <button class="size-box-btn ${s === this.selectedSize ? 'selected' : ''}" data-size="${s}" onclick="Store.selectProductSize('${s}')">
        ${s}
      </button>
    `).join('');

    // Səhifəyə yerləşdirək
    const container = document.getElementById('productPageContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="product-detail-grid">
        <!-- Sol Qalereya -->
        <div class="product-gallery-column">
          ${modePillHtml}
          ${mainCanvasHtml}
          ${thumbsHtml}
        </div>

        <!-- Sağ Detallar -->
        <div class="product-details-column">
          <div class="product-sub-category">${p.subcategory || 'T-shirt'}</div>
          <h1 class="product-main-title">${p.name}</h1>
          <div class="product-price-large">${p.price} ${p.currency}</div>
          <p class="product-description-snippet">${p.description}</p>

          <!-- Rəng Seçimi -->
          <div class="product-option-section">
            <div class="option-header-row">
              <span class="option-title">Rəng: <span id="productColorLabel">${currentColor.name}</span></span>
            </div>
            <div class="color-circles-group">
              ${colorSwatchesHtml}
            </div>
          </div>

          <!-- Ölçü Seçimi -->
          <div class="product-option-section">
            <div class="option-header-row">
              <span class="option-title">Ölçü</span>
              <span class="size-guide-link" onclick="App.showToast('Ölçü Cədvəli: S (46-48), M (48-50), L (50-52), XL (52-54)')">Ölçü cədvəli</span>
            </div>
            <div class="size-boxes-group">
              ${sizeBoxesHtml}
            </div>
          </div>

          <!-- Desktop Düymələr (Şəkil 1) -->
          <div class="product-buy-buttons-group">
            <button class="btn-buy-black" onclick="Store.addToCartFromPage()">
              Səbətə at
            </button>
            <button class="btn-buy-apple" onclick="Store.buyNowApplePay()">
              Apple Pay ilə al
            </button>
          </div>

          <!-- Şərtlər -->
          <div class="product-policy-info">
            Qapıda ödəniş mövcuddur<br>
            Çatdırılma: [MÜDDƏT] (Bakı daxili 24 saat)<br>
            Qaytarma: [ŞƏRTLƏR] (14 gün ərzində)
          </div>

          <!-- Studio Çağırış Kartı -->
          <div class="studio-custom-callout-card">
            <h5>Bu modeli öz dizayınla çap et</h5>
            <button onclick="App.navigate('studio'); Studio.selectStyle('${p.id}');">Studio-da aç</button>
          </div>
        </div>
      </div>
    `;

    // Mobil Sticky Bottom Bar (Şəkil 3)
    const mobileBar = document.getElementById('mobileStickyBottomBar');
    if (mobileBar) {
      mobileBar.style.display = 'flex';
    }
  },

  addToCartFromPage() {
    if (!this.currentProduct) return;
    const currentColor = this.currentProduct.colors[this.selectedColorIndex] || this.currentProduct.colors[0];
    Cart.addItem(this.currentProduct, {
      size: this.selectedSize,
      color: currentColor.name
    });
  },

  buyNowApplePay() {
    if (!this.currentProduct) return;
    this.addToCartFromPage();
    App.navigate('checkout');
    Checkout.setPaymentMethod('apple_pay');
  }
};
