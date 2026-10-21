/**
 * Atelier Studio Customizer Module
 * Print & Garment Customizer
 */

const Studio = {
  config: null,
  state: {
    baseStyle: 'classic-tee', // classic-tee, heavy-hoodie, oversize-tee, essential-tee
    color: { id: 'light-grey', name: 'Açıq Boz', hex: '#E2E0DC', bgHex: '#F2F1EE' },
    size: 'L',
    material: 'cotton-180',
    printPlacement: 'front-center',
    uploadedImage: null,
    customText: '',
    textColor: '#111111',
    totalPrice: 45
  },

  async init() {
    await this.fetchConfig();
    this.renderColorOptions();
    this.updateVisualizer();
    this.calculatePrice();
    this.setupListeners();
  },

  async fetchConfig() {
    try {
      const res = await API.getStudioConfig();
      if (res.success) {
        this.config = res.data;
      }
    } catch (err) {
      console.error('Studio config fetch error:', err);
    }
  },

  selectStyle(styleId) {
    this.state.baseStyle = styleId;
    document.querySelectorAll('.studio-style-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.style === styleId);
    });
    this.updateVisualizer();
    this.calculatePrice();
  },

  setColor(colorObj) {
    this.state.color = colorObj;
    document.querySelectorAll('.studio-color-circle').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.colorId === colorObj.id);
    });
    this.updateVisualizer();
  },

  setSize(size) {
    this.state.size = size;
    document.querySelectorAll('.studio-size-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.size === size);
    });
  },

  setPlacement(placeId) {
    this.state.printPlacement = placeId;
    document.querySelectorAll('.studio-placement-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.placement === placeId);
    });
    this.updateVisualizer();
    this.calculatePrice();
  },

  handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      this.state.uploadedImage = event.target.result;
      this.updateVisualizer();
      this.calculatePrice();
      App.showToast('Dizayn şəkli uğurla yükləndi! 🎨');
    };
    reader.readAsDataURL(file);
  },

  removeImage() {
    this.state.uploadedImage = null;
    const input = document.getElementById('studioUploadInput');
    if (input) input.value = '';
    this.updateVisualizer();
    this.calculatePrice();
  },

  updateText(val) {
    this.state.customText = val;
    this.updateVisualizer();
    this.calculatePrice();
  },

  setTextTone(hex) {
    this.state.textColor = hex;
    this.updateVisualizer();
  },

  calculatePrice() {
    let base = 35;
    if (this.state.baseStyle === 'heavy-hoodie') base = 65;
    if (this.state.baseStyle === 'oversize-tee') base = 40;

    let printExtra = 0;
    if (this.state.uploadedImage || this.state.customText.trim()) {
      printExtra = 10;
      if (this.state.printPlacement === 'both-sides') printExtra = 15;
      if (this.state.printPlacement === 'front-chest') printExtra = 5;
    }

    this.state.totalPrice = base + printExtra;
    const el = document.getElementById('studioCalculatedPrice');
    if (el) el.textContent = `${this.state.totalPrice} ₼`;
  },

  renderColorOptions() {
    const container = document.getElementById('studioColorsPicker');
    if (!container || !this.config) return;

    container.innerHTML = this.config.colors.map(c => `
      <button class="studio-color-circle ${c.id === this.state.color.id ? 'selected' : ''}" 
              data-color-id="${c.id}" 
              onclick='Studio.setColor(${JSON.stringify(c)})'
              title="${c.name}">
        <span style="background: ${c.hex}; border: 1px solid rgba(0,0,0,0.15);"></span>
      </button>
    `).join('');
  },

  updateVisualizer() {
    const stage = document.getElementById('studioLiveVisualizer');
    if (!stage) return;

    const { baseStyle, color, uploadedImage, customText, textColor, printPlacement } = this.state;
    const isHoodie = baseStyle === 'heavy-hoodie';
    const isOversize = baseStyle === 'oversize-tee';

    let silType = 'tshirt';
    if (isHoodie) silType = 'hoodie';
    if (isOversize) silType = 'oversize';

    const baseSvg = Store.getGarmentSvg(silType, color.hex);

    // Print placement coordinates
    let printStyle = 'top: 38%; left: 50%; transform: translate(-50%, -50%); width: 34%;';
    if (printPlacement === 'front-chest') {
      printStyle = 'top: 32%; left: 38%; transform: translate(-50%, -50%); width: 16%;';
    } else if (printPlacement === 'back-large') {
      printStyle = 'top: 42%; left: 50%; transform: translate(-50%, -50%); width: 38%;';
    }

    const printOverlay = (uploadedImage || customText.trim()) ? `
      <div style="position: absolute; ${printStyle} display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; z-index: 10;">
        ${uploadedImage ? `<img src="${uploadedImage}" style="max-width: 100%; max-height: 120px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">` : ''}
        ${customText.trim() ? `<span style="color: ${textColor}; font-weight: 700; font-size: 1rem; text-align: center; line-height: 1.1; margin-top: 4px; text-transform: uppercase;">${customText}</span>` : ''}
      </div>
    ` : '';

    stage.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
        ${baseSvg}
        ${printOverlay}
      </div>
    `;

    // Active color label
    const colNameEl = document.getElementById('studioActiveColorName');
    if (colNameEl) colNameEl.textContent = color.name;
  },

  setupListeners() {
    const uploadInput = document.getElementById('studioUploadInput');
    if (uploadInput) {
      uploadInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }
  },

  addToCart() {
    let name = "Classic Tee (Fərdi Dizayn)";
    if (this.state.baseStyle === 'heavy-hoodie') name = "Heavy Hoodie (Fərdi Dizayn)";
    if (this.state.baseStyle === 'oversize-tee') name = "Oversize Tee (Fərdi Dizayn)";
    if (this.state.baseStyle === 'essential-tee') name = "Essential Tee (Fərdi Dizayn)";

    const product = {
      id: `custom-${this.state.baseStyle}-${Date.now().toString().slice(-4)}`,
      name: name,
      price: this.state.totalPrice,
      currency: "₼",
      category: "Studio",
      subcategory: "Fərdi Çap",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
    };

    const options = {
      size: this.state.size,
      color: this.state.color.name,
      price: this.state.totalPrice,
      customDetails: {
        baseStyle: this.state.baseStyle,
        color: this.state.color.name,
        size: this.state.size,
        printPlacement: this.state.printPlacement,
        customText: this.state.customText || null,
        hasImage: Boolean(this.state.uploadedImage)
      }
    };

    Cart.addItem(product, options);
    App.showToast('Fərdi dizaynınız səbətə əlavə edildi! 🛒');
  }
};
