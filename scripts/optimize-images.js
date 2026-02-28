#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const staticDir = path.join(process.cwd(), 'static');
const imgDir = path.join(staticDir, 'img');

// Gli srcset verranno generati DENTRO static/img per essere copiati dal build
const SIZES = [320, 640, 1280, 1600];

const imageSrcset = {};

function getFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const filePath = path.join(dir, item);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      files = files.concat(getFiles(filePath));
    } else {
      files.push(filePath);
    }
  }
  return files;
}

async function optimizeImage(inputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return;
    }

    const dir = path.dirname(inputPath);
    const filename = path.basename(inputPath);
    const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
    const relPath = path.relative(imgDir, dir);
    const metaKey = relPath.replace(/\\/g, '/');

    // Leggi immagine
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      console.warn(`⚠ Skipped ${inputPath}: cannot read dimensions`);
      return;
    }

    // I srcset vengono generati nella stessa cartella dell'originale (static/img/)
    const sizesToGenerate = SIZES.filter(s => s <= metadata.width);
    const srcset = [];

    for (const size of sizesToGenerate) {
      // JPEG ottimizzato
      const jpegName = `${nameWithoutExt}-${size}w.jpg`;
      const jpegPath = path.join(dir, jpegName);
      const resizeHeight = Math.round(size * metadata.height / metadata.width);
      
      await sharp(inputPath)
        .resize(size, resizeHeight, { withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toFile(jpegPath);
      
      const srcPath = metaKey ? `${metaKey}/${jpegName}` : jpegName;
      srcset.push(`/img/${srcPath} ${size}w`);

      // WebP  
      const webpName = `${nameWithoutExt}-${size}w.webp`;
      const webpPath = path.join(dir, webpName);
      
      await sharp(inputPath)
        .resize(size, resizeHeight, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(webpPath);
    }

    const keyPath = metaKey ? `${metaKey}/${filename}` : filename;
    imageSrcset[keyPath] = {
      original: `/img/${keyPath}`,
      srcset: srcset.join(', '),
      width: metadata.width,
      height: metadata.height,
    };

    if (sizesToGenerate.length > 0) {
      const docId = metaKey ? `${metaKey}/${nameWithoutExt}` : nameWithoutExt;
      console.log(`✓ Optimized: ${docId} (${sizesToGenerate.length} breakpoints)`);
    }
  } catch (err) {
    console.error(`✗ Error optimizing ${inputPath}:`, err.message);
  }
}

(async () => {
  try {
    console.log('🖼 Optimizing images with Sharp...');
    const files = getFiles(imgDir);
    
    for (const file of files) {
      await optimizeImage(file);
    }

    // Scrivi srcset metadata
    const outputFile = path.join(staticDir, 'image-srcset.json');
    fs.writeFileSync(outputFile, JSON.stringify(imageSrcset, null, 2));
    console.log(`✅ Generated ${outputFile} with ${Object.keys(imageSrcset).length} images`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();

