const fs = require('fs');
const path = require('path');

const storeDataPath = path.join(__dirname, '../data/storeData.json');
const publicDir = path.join(__dirname, '../public');

const raw = fs.readFileSync(storeDataPath, 'utf8');
const storeData = JSON.parse(raw);

console.log(`Loaded storeData with ${storeData.products.length} products.`);

for (const p of storeData.products) {
  const prodFolder = path.join(publicDir, 'images/products', p.id);
  const mockupPath = path.join(prodFolder, 'mockup.jpg');
  const frontPath = path.join(prodFolder, 'front.jpg');
  const backPath = path.join(prodFolder, 'back.jpg');

  const hasMockup = fs.existsSync(mockupPath);
  const hasFront = fs.existsSync(frontPath);
  const hasBack = fs.existsSync(backPath);

  if (hasMockup) {
    const modelImg = `/images/products/${p.id}/mockup.jpg`;
    const frontImg = hasFront ? `/images/products/${p.id}/front.jpg` : (p.colors[0]?.image || modelImg);
    const backImg = hasBack ? `/images/products/${p.id}/back.jpg` : null;

    if (p.colors && p.colors.length > 0) {
      for (let i = 0; i < p.colors.length; i++) {
        const c = p.colors[i];
        const oldImg = c.image;
        c.image = modelImg;
        c.hoverImage = frontImg;
        
        const gallery = [modelImg, frontImg];
        if (backImg && !gallery.includes(backImg)) {
          gallery.push(backImg);
        }
        if (oldImg && !gallery.includes(oldImg) && !oldImg.includes('mockup.jpg')) {
          gallery.push(oldImg);
        }
        // Deduplicate
        c.gallery = Array.from(new Set(gallery));
      }
    }
    console.log(`Updated product [${p.id}]: primary image -> ${modelImg}`);
  } else {
    console.log(`Product [${p.id}] has no mockup.jpg in images/products/${p.id}`);
  }
}

fs.writeFileSync(storeDataPath, JSON.stringify(storeData, null, 2), 'utf8');
console.log('Successfully saved updated storeData.json!');
