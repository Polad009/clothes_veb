// Pre-warm all site pages so they are already compiled and respond in milliseconds
const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/collections',
  'http://localhost:3000/collections?category=koynek',
  'http://localhost:3000/collections?category=hudi',
  'http://localhost:3000/collections?category=salvar',
  'http://localhost:3000/collections?category=aksesuar',
  'http://localhost:3000/studio',
  'http://localhost:3000/track',
  'http://localhost:3000/products/vintage-king-of-pop-tee',
  'http://localhost:3000/products/heavyweight-hoodie-black',
  'http://localhost:3000/products/classic-straight-indigo-jeans'
];

async function warm() {
  console.log("Pre-warming all site routes...");
  for (const url of urls) {
    const t0 = Date.now();
    try {
      const res = await fetch(url);
      const dt = Date.now() - t0;
      console.log(`✓ ${url} -> ${res.status} (${dt}ms)`);
    } catch (e) {
      console.error(`✗ ${url} error:`, e.message);
    }
  }
  console.log("All routes warmed up successfully!");
}

warm();
