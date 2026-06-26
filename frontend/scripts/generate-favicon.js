const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const logoPath = process.argv[2] || path.join(__dirname, '../public/assets/logo/logo-no-bac.png');
const publicDir = path.join(__dirname, '../public');

async function generate() {
  const inputBuffer = fs.readFileSync(logoPath);

  // 16x16 for browser tabs and address bar
  await sharp(inputBuffer)
    .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  // 32x32 for standard favicon
  await sharp(inputBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  // 180x180 for Apple touch icon
  await sharp(inputBuffer)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 192x192 for Android
  await sharp(inputBuffer)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'android-chrome-192x192.png'));

  // 512x512 for PWA
  await sharp(inputBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'android-chrome-512x512.png'));

  // Replace favicon.png with 32x32 version for direct URL access
  await sharp(inputBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  // Also update app/favicon.png for Next.js app directory
  const appDir = path.join(__dirname, '../src/app');
  if (fs.existsSync(appDir)) {
    fs.copyFileSync(path.join(publicDir, 'favicon.png'), path.join(appDir, 'favicon.png'));
  }

  console.log('Favicon images generated successfully.');
}

generate().catch(err => {
  console.error('Failed to generate favicons:', err);
  process.exit(1);
});
