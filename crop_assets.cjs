const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImages() {
  const brandSheetPath = process.argv[2];
  const heroImagePath = process.argv[3];
  
  const publicDir = path.join(__dirname, 'public');
  
  if (!fs.existsSync(brandSheetPath)) {
    console.error('Brand sheet not found:', brandSheetPath);
    return;
  }

  // 1. Crop Horizontal Logo (Top left area)
  // Approximate coordinates based on standard brand sheets. Adjusting safely.
  await sharp(brandSheetPath)
    .extract({ left: 30, top: 40, width: 600, height: 180 })
    .toFile(path.join(publicDir, 'logo.png'));
    
  console.log('✅ Cropped logo.png');

  // 2. Crop Favicon (Bottom right area - App Icon)
  // Approximate coordinates for the dark app icon
  await sharp(brandSheetPath)
    .extract({ left: 780, top: 690, width: 100, height: 100 })
    .toFile(path.join(publicDir, 'favicon.png'));
    
  console.log('✅ Cropped favicon.png');
  
  // 3. Copy Hero Image
  if (heroImagePath && fs.existsSync(heroImagePath)) {
    fs.copyFileSync(heroImagePath, path.join(publicDir, 'hero-bg.png'));
    console.log('✅ Copied hero-bg.png');
  }
}

processImages().catch(console.error);
