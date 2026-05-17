const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function generateIcons() {
  try {
    console.log('Generating PWA icons from logo.png...');
    const logoPath = path.join(__dirname, 'public/logo.png');
    const iconsDir = path.join(__dirname, 'public/pwa-icons');

    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    const image = await Jimp.read(logoPath);
    
    // Ensure the image has a background or keep it transparent?
    // PWA icons are generally fine with transparency, but apple-touch-icon should have a solid background (often white).
    await image.clone().resize({ w: 192, h: 192 }).write('public/pwa-icons/icon-192x192.png');
    console.log('Generated icon-192x192.png');
    
    await image.clone().resize({ w: 512, h: 512 }).write('public/pwa-icons/icon-512x512.png');
    console.log('Generated icon-512x512.png');
    
    // Apple touch icon (180x180, solid background recommended)
    const appleIcon = new Jimp({ width: 180, height: 180, color: '#FFFFFF' });
    // Scale logo down slightly to fit nicely inside the apple icon
    const scaledLogo = image.clone().resize({ w: 140, h: 140 });
    const x = (180 - scaledLogo.bitmap.width) / 2;
    const y = (180 - scaledLogo.bitmap.height) / 2;
    appleIcon.composite(scaledLogo, x, y);
    await appleIcon.write('public/pwa-icons/apple-touch-icon.png');
    console.log('Generated apple-touch-icon.png');
    
    console.log('Done!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
