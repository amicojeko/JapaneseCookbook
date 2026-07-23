// Generate PWA manifest screenshots (promotional app previews).
//
// Standalone, NOT part of the prebuild chain — run by hand:
//   node scripts/generate-pwa-screenshots.js
//
// Produces branded "app preview" images used by the manifest `screenshots`
// field (richer install UI on Chromium desktop/Android):
//   - screenshot-wide.jpg    1280x720  (form_factor: wide  → desktop install)
//   - screenshot-narrow.jpg   720x1280 (form_factor: narrow → mobile install)
//
// Composition: a yellow (--pg-yellow) top bar with the logo, over a paper
// (--pg-paper) canvas holding a bentō grid of real recipe photos. No text is
// rasterized (avoids fontconfig fallback surprises); the brand chrome + photos
// carry it.

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const IMG = (p) => path.join(ROOT, 'static/img', p);
const OUT_DIR = path.join(ROOT, 'static/img/pwa');
const LOGO = IMG('logo_katakana.png');

const PAPER = { r: 0xfb, g: 0xf7, b: 0xec, alpha: 1 }; // --pg-paper
const YELLOW = { r: 0xff, g: 0xdc, b: 0x06, alpha: 1 }; // --pg-yellow

fs.mkdirSync(OUT_DIR, { recursive: true });

// Appetizing square-ish recipe photos to feature.
const PHOTOS = [
  'ricette/gyoza1.jpg',
  'ricette/onigiri_kimchi_asiago.jpg',
  'ricette/yakisoba.jpg',
  'ricette/kakuni.jpg',
  'ricette/nasudengaku.jpg',
  'ricette/potetosarada.jpg',
  'ricette/hiyayakko.jpg',
  'ricette/tofu_and_eggs.jpg',
  'ricette/vegan_misoshiru.jpg',
  'ricette/yamitsuki_kyabesu.jpg',
];

// Rounded-corner mask for a cell (bentō tile look).
function roundedMask(w, h, r) {
  const svg = `<svg width="${w}" height="${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`;
  return Buffer.from(svg);
}

async function tile(photoRel, w, h) {
  const cover = await sharp(IMG(photoRel))
    .resize({ width: w, height: h, fit: 'cover', position: 'attention' })
    .toBuffer();
  // apply rounded corners
  return sharp(cover)
    .composite([{ input: roundedMask(w, h, 18), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function build({ width, height, cols, rows, barH, margin, gap, outfile, photos }) {
  const composites = [];

  // Yellow top bar.
  const bar = await sharp({
    create: { width, height: barH, channels: 4, background: YELLOW },
  })
    .png()
    .toBuffer();
  composites.push({ input: bar, top: 0, left: 0 });

  // Logo in the bar (left aligned, vertically centered).
  const logoH = Math.round(barH * 0.5);
  const logo = await sharp(LOGO).resize({ height: logoH }).png().toBuffer();
  const logoMeta = await sharp(logo).metadata();
  composites.push({
    input: logo,
    top: Math.round((barH - logoMeta.height) / 2),
    left: margin,
  });

  // Photo grid.
  const gridTop = barH + margin;
  const innerW = width - margin * 2;
  const innerH = height - gridTop - margin;
  const cellW = Math.floor((innerW - gap * (cols - 1)) / cols);
  const cellH = Math.floor((innerH - gap * (rows - 1)) / rows);

  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const photo = photos[i % photos.length];
      i++;
      const t = await tile(photo, cellW, cellH);
      composites.push({
        input: t,
        top: gridTop + r * (cellH + gap),
        left: margin + c * (cellW + gap),
      });
    }
  }

  // Final canvas is fully opaque (paper background), so JPEG is safe and keeps
  // the file ~10x smaller than PNG. Rounded tile corners stay paper-colored.
  await sharp({
    create: { width, height, channels: 4, background: PAPER },
  })
    .composite(composites)
    .flatten({ background: PAPER })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT_DIR, outfile));

  console.log(`  ✓ ${outfile} (${width}x${height})`);
}

(async () => {
  console.log('Generating PWA screenshots…');
  await build({
    width: 1280,
    height: 720,
    cols: 3,
    rows: 2,
    barH: 72,
    margin: 24,
    gap: 16,
    outfile: 'screenshot-wide.jpg',
    photos: PHOTOS,
  });
  await build({
    width: 720,
    height: 1280,
    cols: 2,
    rows: 4,
    barH: 72,
    margin: 20,
    gap: 16,
    outfile: 'screenshot-narrow.jpg',
    photos: PHOTOS,
  });
  console.log('Done →', path.relative(ROOT, OUT_DIR));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
