#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const docsDir = path.join(process.cwd(), 'docs');
const outputDir = path.join(process.cwd(), 'static');
const outputFile = path.join(outputDir, 'image-metadata.json');

// Crea cartella output se non esiste
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const imageMap = {};

function walkDir(dir, prefix = '') {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath, prefix ? `${prefix}/${file}` : file);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(content);

        if (data.image) {
          const docId = prefix
            ? `${prefix}/${file.replace(/\.mdx?$/, '')}`
            : file.replace(/\.mdx?$/, '');
          imageMap[docId] = data.image;
        }
      } catch (e) {
        console.error(`Errore nel file ${filePath}:`, e.message);
      }
    }
  }
}

try {
  walkDir(docsDir);
  fs.writeFileSync(outputFile, JSON.stringify(imageMap, null, 2));
} catch (error) {
  console.error('Errore nella generazione dei metadati:', error);
  process.exit(1);
}
