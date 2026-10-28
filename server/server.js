const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const db = require('./db');

const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files with Cache-Control headers for images
app.use(express.static(path.join(__dirname, '..', 'public'), {
  index: false,
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (/\.(png|jpe?g|webp|avif|svg|gif|woff2?|wasm|onnx)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    name: 'HORVVALLE Fashion API',
    store: 'HORVVALLE',
    time: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Root & Browser Fallback: Browser navigation redirects directly to the active HORVVALLE store
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.redirect('http://localhost:3000');
  }
  res.json({
    name: 'HORVVALLE Fashion API',
    status: 'online',
    storeUrl: 'http://localhost:3000',
    adminUrl: 'http://localhost:3001',
    productsApi: '/api/products',
    healthApi: '/api/health'
  });
});

// SPA / 404 fallback for non-API routes
app.use((req, res) => {
  if (req.accepts('html')) {
    return res.redirect('http://localhost:3000');
  }
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Server start
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  ✨ HORVVALLE Lüks Geyim Mağazası & Backend API ✨`);
  console.log(`  🌐 Store URL: http://localhost:3000`);
  console.log(`  🛍️  API URL:   http://localhost:${PORT}/api/products`);
  console.log(`====================================================`);
});
