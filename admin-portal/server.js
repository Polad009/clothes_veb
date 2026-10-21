const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.ADMIN_PORT || 3001;
const DB_PATH = path.join(__dirname, '..', 'data', 'storeData.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to read and write database
function readDb() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Serve Admin UI Static Files
app.use(express.static(path.join(__dirname, 'public')));

// API: Get Full Store Data
app.get('/api/admin/data', (req, res) => {
  try {
    const data = readDb();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Save Product (Add or Edit)
app.post('/api/admin/products', (req, res) => {
  try {
    const product = req.body;
    const db = readDb();
    const existingIndex = db.products.findIndex(p => p.id === product.id);

    if (existingIndex >= 0) {
      db.products[existingIndex] = { ...db.products[existingIndex], ...product };
    } else {
      if (!product.id) product.id = 'vtx-' + Date.now().toString(36);
      if (!product.slug) product.slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      db.products.unshift(product);
    }

    writeDb(db);
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete Product
app.delete('/api/admin/products/:id', (req, res) => {
  try {
    const db = readDb();
    db.products = db.products.filter(p => p.id !== req.params.id);
    writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Dynamic CMS Content & Settings
app.post('/api/admin/content', (req, res) => {
  try {
    const { settings, content } = req.body;
    const db = readDb();
    if (settings) db.settings = { ...db.settings, ...settings };
    if (content) db.content = { ...db.content, ...content };
    writeDb(db);
    res.json({ success: true, settings: db.settings, content: db.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Order Status
app.patch('/api/admin/orders/:id', (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const db = readDb();
    const index = db.orders.findIndex(o => o.id === req.params.id);
    if (index >= 0) {
      if (orderStatus) db.orders[index].orderStatus = orderStatus;
      if (paymentStatus) db.orders[index].paymentStatus = paymentStatus;
      writeDb(db);
      res.json({ success: true, order: db.orders[index] });
    } else {
      res.status(404).json({ error: 'Sifariş tapılmadı' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Print-on-Demand Order Status
app.patch('/api/admin/pod-orders/:id', (req, res) => {
  try {
    const { status } = req.body;
    const db = readDb();
    const index = (db.podOrders || []).findIndex(p => p.id === req.params.id);
    if (index >= 0) {
      db.podOrders[index].status = status;
      writeDb(db);
      res.json({ success: true, podOrder: db.podOrders[index] });
    } else {
      res.status(404).json({ error: 'Fərdi çap sifarişi tapılmadı' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Add or Edit Promo Code
app.post('/api/admin/promos', (req, res) => {
  try {
    const promo = req.body;
    const db = readDb();
    if (!db.promoCodes) db.promoCodes = [];
    const index = db.promoCodes.findIndex(p => p.id === promo.id || p.code === promo.code);
    if (index >= 0) {
      db.promoCodes[index] = { ...db.promoCodes[index], ...promo };
    } else {
      promo.id = promo.id || 'promo-' + Date.now();
      db.promoCodes.unshift(promo);
    }
    writeDb(db);
    res.json({ success: true, promo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete Promo Code
app.delete('/api/admin/promos/:id', (req, res) => {
  try {
    const db = readDb();
    db.promoCodes = (db.promoCodes || []).filter(p => p.id !== req.params.id && p.code !== req.params.id);
    writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Gallery Images
app.get('/api/admin/gallery', (req, res) => {
  try {
    const imagesDir = path.join(__dirname, '..', 'public', 'images');
    const list = [];
    function scan(dir) {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
          scan(full);
        } else if (/\.(jpg|jpeg|png|webp|svg)$/i.test(f)) {
          const rel = path.relative(path.join(__dirname, '..', 'public'), full);
          list.push('/' + rel.replace(/\\/g, '/'));
        }
      }
    }
    scan(imagesDir);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Direct Image Upload
app.post('/api/admin/upload-image', (req, res) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl) return res.status(400).json({ error: 'dataUrl required' });
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 string' });
    }
    const buffer = Buffer.from(matches[2], 'base64');
    let ext = matches[1].split('/')[1] || 'png';
    if (ext === 'jpeg') ext = 'jpg';
    const uploadDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const cleanName = (filename || 'img').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const finalName = `${cleanName}_${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(uploadDir, finalName), buffer);
    res.json({ success: true, url: `/images/uploads/${finalName}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback to Admin Dashboard
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🛡️  HORVVALLE — AYRICA ADMİN PORTALI             `);
  console.log(`  🌐 URL: http://localhost:${PORT}                  `);
  console.log(`  ⚙️  Rejim: Müstəqil İdarəetmə Paneli              `);
  console.log(`====================================================`);
});
