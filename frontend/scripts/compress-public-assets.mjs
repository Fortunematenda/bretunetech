/**
 * One-shot compressor for heavy public PNG/JPEG assets.
 * Rewrites files in place as optimized PNG (logos/favicons) or WebP siblings for heroes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const TARGETS = [
  // Logos / OG used in layout + nav
  { rel: 'assets/logo/logo-no-bac.png', maxWidth: 480, format: 'png' },
  { rel: 'assets/logo/logo.png', maxWidth: 640, format: 'png' },
  { rel: 'assets/logo/og-image.png', maxWidth: 1200, format: 'png' },
  { rel: 'assets/logo/logoa.png', maxWidth: 480, format: 'png' },
  { rel: 'favicon.png', maxWidth: 64, format: 'png' },
  { rel: 'favicon-32x32.png', maxWidth: 32, format: 'png' },
  { rel: 'favicon-16x16.png', maxWidth: 16, format: 'png' },
  { rel: 'apple-touch-icon.png', maxWidth: 180, format: 'png' },
  // Hero PNGs (keep filename; shrink in place for existing references)
  { rel: 'assets/hero/installation.png', maxWidth: 1600, format: 'png' },
  { rel: 'assets/hero/networking.png', maxWidth: 1600, format: 'png' },
  { rel: 'assets/hero/combined.png', maxWidth: 1600, format: 'png' },
  { rel: 'assets/hero/camera.png', maxWidth: 1600, format: 'png' },
  { rel: 'assets/hero/inverter.png', maxWidth: 1600, format: 'png' },
];

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function compressOne({ rel, maxWidth, format }) {
  const filePath = path.join(publicDir, rel);
  if (!fs.existsSync(filePath)) {
    console.log(`skip missing: ${rel}`);
    return;
  }
  const before = fs.statSync(filePath).size;
  const input = fs.readFileSync(filePath);
  let pipeline = sharp(input).rotate().resize({
    width: maxWidth,
    height: maxWidth,
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (format === 'png') {
    pipeline = pipeline.png({ compressionLevel: 9, quality: 80, palette: true });
  } else {
    pipeline = pipeline.webp({ quality: 78 });
  }

  const out = await pipeline.toBuffer();
  if (out.length >= before * 0.98) {
    console.log(`keep  ${rel} (${formatKb(before)}) — already small enough`);
    return;
  }
  fs.writeFileSync(filePath, out);
  console.log(`ok    ${rel}: ${formatKb(before)} → ${formatKb(out.length)}`);
}

for (const target of TARGETS) {
  try {
    await compressOne(target);
  } catch (err) {
    console.error(`fail  ${target.rel}:`, err.message);
  }
}
