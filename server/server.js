const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    name: 'Atelier Fashion API',
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

// SPA fallback - hər hansı route üçün index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Server start
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  ✨ Atelier Lüks Geyim Mağazası & Studio Serveri ✨`);
  console.log(`  🌐 URL: http://localhost:${PORT}`);
  console.log(`  🛍️  API: http://localhost:${PORT}/api/products`);
  console.log(`====================================================`);
});
