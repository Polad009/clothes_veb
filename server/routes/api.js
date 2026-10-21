const express = require('express');
const router = express.Router();
const db = require('../db');

// --- Məhsullar ---
router.get('/products', (req, res) => {
  try {
    const products = db.getProducts(req.query);
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/products/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Məhsul tapılmadı" });
    }
    const reviews = db.getReviews(req.params.id);
    res.json({ success: true, data: { ...product, reviews } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/products', (req, res) => {
  try {
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({ success: false, error: "Ad və qiymət tələb olunur" });
    }
    const newProduct = db.addProduct(req.body);
    res.status(201).json({ success: true, message: "Məhsul əlavə edildi", data: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/products/:id', (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Məhsul tapılmadı" });
    }
    res.json({ success: true, message: "Məhsul yeniləndi", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/products/:id', (req, res) => {
  try {
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Məhsul tapılmadı" });
    }
    res.json({ success: true, message: "Məhsul uğurla silindi" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Kateqoriyalar ---
router.get('/categories', (req, res) => {
  try {
    const dbData = db.read();
    res.json({ success: true, data: dbData.categories || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Studio (Fərdiləşdirmə) ---
router.get('/studio/config', (req, res) => {
  try {
    const config = db.getStudioConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/studio/calculate', (req, res) => {
  try {
    const { baseStyleId, materialId, buttonId, lapelId, liningId, hasMonogram } = req.body;
    const config = db.getStudioConfig();

    const style = config.baseStyles.find(s => s.id === baseStyleId) || config.baseStyles[0];
    const material = config.materials.find(m => m.id === materialId) || config.materials[0];
    const button = config.customOptions.buttons.find(b => b.id === buttonId);
    const lapel = config.customOptions.lapels.find(l => l.id === lapelId);
    const lining = config.customOptions.linings.find(l => l.id === liningId);

    let price = style.basePrice * (material.priceMultiplier || 1.0);
    if (button) price += button.extraPrice || 0;
    if (lapel) price += lapel.extraPrice || 0;
    if (lining) price += lining.extraPrice || 0;
    if (hasMonogram) price += config.customOptions.monogramOptions.price || 0;

    price = Math.round(price);

    res.json({
      success: true,
      data: {
        calculatedPrice: price,
        currency: "AZN",
        breakdown: {
          baseStyle: style.name,
          basePrice: style.basePrice,
          material: material.name,
          materialMultiplier: material.priceMultiplier,
          button: button ? button.name : null,
          lapel: lapel ? lapel.name : null,
          lining: lining ? lining.name : null,
          monogramPrice: hasMonogram ? 20 : 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/studio/save', (req, res) => {
  try {
    const saved = db.saveCustomDesign(req.body);
    res.status(201).json({ success: true, message: "Fərdi dizayn qeyd edildi", data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Promo Kodlar ---
router.post('/promo/validate', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Promo-kod daxil edilməyib" });
    }
    const result = db.validatePromo(code, parseFloat(subtotal) || 0);
    if (result.valid) {
      res.json({ success: true, data: result });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Sifarişlər ---
router.post('/orders', (req, res) => {
  try {
    const { customer, items, subtotal, total } = req.body;
    if (!customer || !customer.fullName || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, error: "Müştəri məlumatları (Ad, Telefon, Ünvan) tam doldurulmalıdır" });
    }
    if (!items || !items.length) {
      return res.status(400).json({ success: false, error: "Səbət boşdur" });
    }

    const order = db.createOrder(req.body);
    res.status(201).json({ 
      success: true, 
      message: "Sifarişiniz uğurla qeydə alındı və hazırlanmaya başlandı!", 
      data: order 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/orders', (req, res) => {
  try {
    const orders = db.getOrders();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/orders/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Sifariş tapılmadı. Zəhmət olmasa Sifariş ID və ya İzləmə kodunu yoxlayın." });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: "Status göstərilməlidir" });
    }
    const order = db.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ success: false, error: "Sifariş tapılmadı" });
    }
    res.json({ success: true, message: "Status yeniləndi", data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Rəylər ---
router.get('/reviews/:productId', (req, res) => {
  try {
    const reviews = db.getReviews(req.params.productId);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/reviews/:productId', (req, res) => {
  try {
    const { author, rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ success: false, error: "Reytinq və rəy mətni tələb olunur" });
    }
    const newReview = db.addReview(req.params.productId, { author, rating, comment });
    res.status(201).json({ success: true, message: "Rəyiniz əlavə edildi!", data: newReview });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Admin Statistikası ---
router.get('/admin/stats', (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
