const fs = require('fs');
const path = require('path');
const {
  initialProducts,
  initialCategories,
  studioMaterials,
  studioColors,
  promoCodes
} = require('./seedData');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_PATH)) {
      const defaultState = {
        products: initialProducts,
        categories: initialCategories,
        studioMaterials: studioMaterials,
        studioColors: studioColors,
        promoCodes: promoCodes,
        orders: [
          {
            id: "ORD-1092",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            customer: {
              fullName: "Murad Həsənov",
              phone: "+994 50 111 22 33",
              email: "murad@example.com",
              city: "Bakı",
              address: "Nizami küçəsi 14"
            },
            items: [
              {
                id: "classic-tee",
                name: "Classic Tee",
                price: 35,
                quantity: 2,
                size: "L",
                color: "Qara"
              }
            ],
            subtotal: 70,
            discount: 7,
            promoCode: "ATELIER10",
            total: 63,
            paymentMethod: "card",
            paymentStatus: "Ödənilib",
            status: "Hazırlanır",
            trackingCode: "AZ-EXP-109245"
          }
        ],
        reviews: {},
        customDesigns: []
      };
      this.write(defaultState);
    }
  }

  read() {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Database read error:', err);
      return { products: initialProducts, orders: [], customDesigns: [] };
    }
  }

  write(data) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Database write error:', err);
      return false;
    }
  }

  // Məhsullar
  getProducts(query = {}) {
    const db = this.read();
    let products = db.products || [];

    if (query.category && query.category !== 'all') {
      const cat = query.category.toLowerCase();
      products = products.filter(p => p.category.toLowerCase() === cat || (p.subcategory && p.subcategory.toLowerCase().includes(cat)));
    }

    if (query.search) {
      const s = query.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(s) || 
        p.description.toLowerCase().includes(s) || 
        p.category.toLowerCase().includes(s)
      );
    }

    return products;
  }

  getProductById(id) {
    const db = this.read();
    return (db.products || []).find(p => p.id === id);
  }

  addProduct(productData) {
    const db = this.read();
    const newProduct = {
      id: productData.id || `item-${Date.now().toString().slice(-4)}`,
      name: productData.name,
      category: productData.category || "Uniseks",
      subcategory: productData.subcategory || "T-Shirt",
      price: parseFloat(productData.price) || 35,
      currency: "₼",
      description: productData.description || "Gündəlik minimalist geyim.",
      material: productData.material || "100% Pambıq",
      sizes: productData.sizes || ["S", "M", "L", "XL"],
      colors: productData.colors || [{ name: "Qara", hex: "#1C1C1E", silhouetteColor: "#222224" }],
      silhouetteType: productData.silhouetteType || "tshirt",
      silhouetteColor: productData.silhouetteColor || "#222224",
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: productData.isFeatured !== undefined ? productData.isFeatured : true,
      customizable: true,
      stock: parseInt(productData.stock) || 30
    };

    db.products.unshift(newProduct);
    this.write(db);
    return newProduct;
  }

  updateProduct(id, updateData) {
    const db = this.read();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    db.products[idx] = { ...db.products[idx], ...updateData };
    this.write(db);
    return db.products[idx];
  }

  deleteProduct(id) {
    const db = this.read();
    const initialLen = db.products.length;
    db.products = db.products.filter(p => p.id !== id);
    if (db.products.length !== initialLen) {
      this.write(db);
      return true;
    }
    return false;
  }

  // Studio konfiqurasiyası
  getStudioConfig() {
    const db = this.read();
    return {
      materials: db.studioMaterials || studioMaterials,
      colors: db.studioColors || studioColors,
      baseStyles: [
        { id: "classic-tee", name: "Classic Tee", basePrice: 35, type: "tshirt" },
        { id: "heavy-hoodie", name: "Heavy Hoodie", basePrice: 65, type: "hoodie" },
        { id: "oversize-tee", name: "Oversize Tee", basePrice: 40, type: "oversize" },
        { id: "essential-tee", name: "Essential Tee", basePrice: 35, type: "tshirt" }
      ],
      printPlacements: [
        { id: "front-center", name: "Ön mərkəz çap (Böyük)", price: 10 },
        { id: "front-chest", name: "Sinə cibi loqo (Kiçik)", price: 5 },
        { id: "back-large", name: "Arxa kürək çap (Böyük)", price: 10 },
        { id: "both-sides", name: "Ön və Arxa ikiqat çap", price: 15 }
      ]
    };
  }

  saveCustomDesign(design) {
    const db = this.read();
    const newDesign = {
      id: `DESIGN-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      ...design
    };
    if (!db.customDesigns) db.customDesigns = [];
    db.customDesigns.unshift(newDesign);
    this.write(db);
    return newDesign;
  }

  // Sifarişlər
  createOrder(orderData) {
    const db = this.read();
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingCode = `AZ-EXP-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer: orderData.customer,
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      promoCode: orderData.promoCode || null,
      shippingCost: 0,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod || "card",
      paymentStatus: orderData.paymentMethod === "cash" ? "Qapıda ödəniləcək" : "Ödənilib",
      status: "Hazırlanır",
      trackingCode: trackingCode,
      notes: orderData.notes || ""
    };

    if (!db.orders) db.orders = [];
    db.orders.unshift(newOrder);

    this.write(db);
    return newOrder;
  }

  getOrders() {
    const db = this.read();
    return db.orders || [];
  }

  getOrderById(id) {
    const db = this.read();
    return (db.orders || []).find(o => o.id.toUpperCase() === id.toUpperCase() || o.trackingCode === id);
  }

  updateOrderStatus(id, status) {
    const db = this.read();
    const order = (db.orders || []).find(o => o.id === id);
    if (!order) return null;

    order.status = status;
    this.write(db);
    return order;
  }

  // Promo kodlar
  validatePromo(code, subtotal) {
    const db = this.read();
    const promoList = db.promoCodes || promoCodes;
    const promo = promoList.find(p => p.code.toUpperCase() === code.trim().toUpperCase());

    if (!promo) {
      return { valid: false, message: "Daxil edilən promo-kod mövcud deyil." };
    }

    if (subtotal < (promo.minAmount || 0)) {
      return { 
        valid: false, 
        message: `Bu promo-kod minimum ${promo.minAmount} ₼ sifariş üçün keçərlidir.` 
      };
    }

    let discount = 0;
    if (promo.discountPercent) {
      discount = Math.round((subtotal * promo.discountPercent) / 100);
    }

    return {
      valid: true,
      code: promo.code,
      discount: discount,
      description: promo.desc,
      message: `Təbriklər! ${discount} ₼ endirim tətbiq edildi.`
    };
  }

  // Rəylər
  getReviews(productId) {
    const db = this.read();
    const reviewsMap = db.reviews || {};
    return reviewsMap[productId] || [];
  }

  addReview(productId, reviewData) {
    const db = this.read();
    if (!db.reviews) db.reviews = {};
    if (!db.reviews[productId]) db.reviews[productId] = [];

    const newRev = {
      id: `rev-${Date.now()}`,
      author: reviewData.author || "Müştəri",
      rating: parseInt(reviewData.rating) || 5,
      date: new Date().toISOString().split('T')[0],
      comment: reviewData.comment || ""
    };

    db.reviews[productId].unshift(newRev);
    this.write(db);
    return newRev;
  }

  // Statistika
  getDashboardStats() {
    const db = this.read();
    const orders = db.orders || [];
    const products = db.products || [];
    
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const activeProducts = products.length;
    const pendingOrders = orders.filter(o => o.status !== "Çatdırıldı").length;

    return {
      totalRevenue,
      totalOrders,
      activeProducts,
      pendingOrders,
      recentOrders: orders.slice(0, 5)
    };
  }
}

module.exports = new Database();
