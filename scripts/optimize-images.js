#!/usr/bin/env node

/**
 * Generate responsive image variants (-320w / -640w / -1280w / -1600w, both
 * .jpg and .webp) for every master image in static/img/, and a manifest
 * static/image-srcset.json that maps master → variants + the master's MD5.
 *
 * INCREMENTAL: walks every master and compares its current MD5 against the
 * manifest. If the hash matches *and* all expected variants exist on disk,
 * skip. Otherwise regenerate that master's variants. Orphan variants whose
 * master is gone are cleaned up. The script is therefore cheap on no-op runs
 * and only does real work when content actually changed — that's why it's
 * driven from .husky/pre-commit rather than from `npm run build`.
 *
 * Force a full rebuild by deleting static/image-srcset.json before running.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const staticDir = path.join(process.cwd(), 'static');
const imgDir = path.join(staticDir, 'img');
const manifestPath = path.join(staticDir, 'image-srcset.json');

const SIZES = [320, 640, 1280, 1600];
const MASTER_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

function md5OfFile(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

function isVariantFilename(filename) {
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  return /-\d+w$/.test(nameWithoutExt);
}

function loadManifest() {
  if (!fs.existsSync(manifestPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.warn(`⚠ manifest unreadable, treating as empty: ${e.message}`);
    return {};
  }
}

function walkMasters(dir) {
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    const filePath = path.join(dir, item);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      out.push(...walkMasters(filePath));
      continue;
    }
    const ext = path.extname(filePath).toLowerCase();
    if (!MASTER_EXT.includes(ext)) continue;
    if (isVariantFilename(path.basename(filePath))) continue;
    out.push(filePath);
  }
  return out;
}

function manifestKeyFor(masterPath) {
  return path.relative(imgDir, masterPath).replace(/\\/g, '/');
}

function expectedVariantPaths(masterPath, width) {
  const dir = path.dirname(masterPath);
  const nameWithoutExt = path.basename(masterPath).replace(/\.[^.]+$/, '');
  const out = [];
  for (const size of SIZES) {
    if (width != null && size > width) continue;
    out.push(path.join(dir, `${nameWithoutExt}-${size}w.jpg`));
    out.push(path.join(dir, `${nameWithoutExt}-${size}w.webp`));
  }
  return out;
}

async function optimizeMaster(masterPath, hash) {
  const dir = path.dirname(masterPath);
  const filename = path.basename(masterPath);
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');

  const metadata = await sharp(masterPath).metadata();
  if (!metadata.width || !metadata.height) {
    console.warn(`⚠ skip ${masterPath}: cannot read dimensions`);
    return null;
  }

  // Wipe any existing variants for this master (dimensions might have shifted
  // and old breakpoints could be stale).
  for (const v of expectedVariantPaths(masterPath, null)) {
    if (fs.existsSync(v)) fs.unlinkSync(v);
  }

  const relDir = path.relative(imgDir, dir).replace(/\\/g, '/');
  const sizesToGenerate = SIZES.filter(s => s <= metadata.width);
  const srcset = [];

  for (const size of sizesToGenerate) {
    const jpegName = `${nameWithoutExt}-${size}w.jpg`;
    const webpName = `${nameWithoutExt}-${size}w.webp`;
    const resizeHeight = Math.round((size * metadata.height) / metadata.width);

    await sharp(masterPath)
      .resize(size, resizeHeight, {withoutEnlargement: true})
      .jpeg({quality: 80, progressive: true})
      .toFile(path.join(dir, jpegName));

    await sharp(masterPath)
      .resize(size, resizeHeight, {withoutEnlargement: true})
      .webp({quality: 80})
      .toFile(path.join(dir, webpName));

    const srcPath = relDir ? `${relDir}/${jpegName}` : jpegName;
    srcset.push(`/img/${srcPath} ${size}w`);
  }

  const keyPath = relDir ? `${relDir}/${filename}` : filename;
  return {
    keyPath,
    entry: {
      hash,
      original: `/img/${keyPath}`,
      srcset: srcset.join(', '),
      width: metadata.width,
      height: metadata.height,
    },
    breakpoints: sizesToGenerate.length,
  };
}

(async () => {
  try {
    if (!fs.existsSync(imgDir)) {
      console.log('No static/img/ directory — nothing to do.');
      return;
    }

    const manifest = loadManifest();
    const newManifest = {};
    const masters = walkMasters(imgDir);
    let processed = 0;
    let skipped = 0;

    for (const masterPath of masters) {
      const key = manifestKeyFor(masterPath);
      const hash = md5OfFile(masterPath);
      const existing = manifest[key];

      // Cache hit: same hash AND all expected variants present on disk.
      if (existing && existing.hash === hash) {
        const allVariantsExist = expectedVariantPaths(masterPath, existing.width)
          .every(v => fs.existsSync(v));
        if (allVariantsExist) {
          newManifest[key] = existing;
          skipped++;
          continue;
        }
      }

      const result = await optimizeMaster(masterPath, hash);
      if (result) {
        newManifest[result.keyPath] = result.entry;
        processed++;
        console.log(`✓ ${result.keyPath} (${result.breakpoints} breakpoints)`);
      }
    }

    // Clean up orphan variants (masters that no longer exist).
    const currentKeys = new Set(masters.map(manifestKeyFor));
    const orphans = Object.keys(manifest).filter(k => !currentKeys.has(k));
    let removed = 0;
    for (const orphanKey of orphans) {
      const orphanMaster = path.join(imgDir, orphanKey);
      for (const v of expectedVariantPaths(orphanMaster, manifest[orphanKey].width)) {
        if (fs.existsSync(v)) {
          fs.unlinkSync(v);
          removed++;
          console.log(`✗ removed orphan ${path.relative(staticDir, v)}`);
        }
      }
    }

    // Stable, alphabetically sorted manifest for clean diffs.
    const sorted = Object.fromEntries(
      Object.keys(newManifest).sort().map(k => [k, newManifest[k]])
    );
    fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 2) + '\n');

    console.log(
      `\n🖼  image-srcset.json: ${processed} processed, ${skipped} skipped, ${removed} orphan variants removed`
    );
  } catch (err) {
    console.error('❌ optimize-images failed:', err);
    process.exit(1);
  }
})();
