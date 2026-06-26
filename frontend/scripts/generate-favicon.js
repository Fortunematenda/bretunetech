const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const logoPath = process.argv[2] || path.join(__dirname, '../public/assets/logo/favcon.png');
const publicDir = path.join(__dirname, '../public');

async function generate() {
  const inputBuffer = fs.readFileSync(logoPath);

  // Trim whitespace first so the logo fills the full icon, then add a small padding (5%)
  const trimmed = await sharp(inputBuffer)
    .trim({ threshold: 20 })
    .toBuffer();

  const padding = (size) => Math.round(size * 0.05);

  const resizeWithPadding = (size) =>
    sharp(trimmed)
      .resize(size - padding(size) * 2, size - padding(size) * 2, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({
        top: padding(size), bottom: padding(size),
        left: padding(size), right: padding(size),
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png();

  await resizeWithPadding(16).toFile(path.join(publicDir, 'favicon-16x16.png'));
  await resizeWithPadding(32).toFile(path.join(publicDir, 'favicon-32x32.png'));
  await resizeWithPadding(32).toFile(path.join(publicDir, 'favicon.png'));
  await resizeWithPadding(180).toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await resizeWithPadding(192).toFile(path.join(publicDir, 'android-chrome-192x192.png'));
  await resizeWithPadding(512).toFile(path.join(publicDir, 'android-chrome-512x512.png'));

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
