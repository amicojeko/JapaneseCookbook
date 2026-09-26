// Generate PWA icons from the site logo.
//
// Standalone, NOT part of the prebuild chain — run it by hand when the source
// logo changes:  node scripts/generate-pwa-icons.js
//
// Outputs to static/img/pwa/:
//   - icon-192.png            standard any-purpose icon
//   - icon-512.png            standard any-purpose icon (splash / install)
//   - icon-maskable-512.png   maskable (extra safe-zone padding for Android adaptive icons)
//   - apple-touch-icon.png    180x180 for iOS home-screen (iOS ignores the manifest icons)
//
// The source logo (logo_katakana.png) is landscape red-on-yellow katakana. We
// composite it centered on a square Bentō×Izakaya yellow canvas. The maskable
// variant keeps the artwork inside the inner ~64% so it survives the circular
// mask Android applies.

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'static/img/logo_katakana.png');
const OUT_DIR = path.join(ROOT, 'static/img/pwa');

// Bentō×Izakaya brand yellow (--pg-yellow in src/css/custom.css).
const YELLOW = { r: 0xff, g: 0xdc, b: 0x06, alpha: 1 };

fs.mkdirSync(OUT_DIR, { recursive: true });

async function makeIcon(size, outfile, contentRatio) {
  // Scale the logo so its width fits `contentRatio` of the canvas, then center it.
  const logoWidth = Math.round(size * contentRatio);
  const logo = await sharp(SRC)
    .resize({ width: logoWidth, fit: 'inside' })
    .toBuffer();
  const meta = await sharp(logo).metadata();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: YELLOW,
    },
  })
    .composite([
      {
        input: logo,
        top: Math.round((size - meta.height) / 2),
        left: Math.round((size - meta.width) / 2),
      },
    ])
    .png()
    .toFile(path.join(OUT_DIR, outfile));

  console.log(`  ✓ ${outfile} (${size}x${size})`);
}

(async () => {
  console.log('Generating PWA icons from', path.relative(ROOT, SRC));
  // any-purpose icons: logo fills ~82% width
  await makeIcon(192, 'icon-192.png', 0.82);
  await makeIcon(512, 'icon-512.png', 0.82);
  // maskable: keep artwork inside the inner safe zone (~64% width)
  await makeIcon(512, 'icon-maskable-512.png', 0.64);
  // apple-touch: iOS crops the corners into a squircle, keep a little padding
  await makeIcon(180, 'apple-touch-icon.png', 0.78);
  console.log('Done →', path.relative(ROOT, OUT_DIR));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
