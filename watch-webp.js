#!/usr/bin/env node
/**
 * WebP watcher — monitors img/ for PNG/JPG changes and regenerates .webp
 * Start:  node watch-webp.js
 * Stop:   Ctrl+C
 */

const fs = require('fs');
const path = require('path');

// Reuse sharp from the existing install location
const sharp = require('/tmp/svg-render/node_modules/sharp');

const IMG_DIR = path.join(__dirname, 'img');
const MAX_W = 1600;
const EXTS = new Set(['.png', '.jpg', '.jpeg']);

// Debounce map to avoid double-firing on save
const pending = new Map();

async function convert(srcPath) {
  const ext = path.extname(srcPath).toLowerCase();
  if (!EXTS.has(ext)) return;

  // Skip files that are themselves WebP source conversions or temp files
  if (path.basename(srcPath).startsWith('.')) return;

  const outPath = srcPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  try {
    const meta = await sharp(srcPath).metadata();
    const pipeline = sharp(srcPath);
    if (meta.width > MAX_W) pipeline.resize({ width: MAX_W });
    await pipeline.webp({ quality: 85 }).toFile(outPath);

    const inKB  = Math.round(fs.statSync(srcPath).size / 1024);
    const outKB = Math.round(fs.statSync(outPath).size / 1024);
    const rel   = path.relative(__dirname, srcPath);
    console.log(`✓  ${rel}  →  .webp  (${inKB}KB → ${outKB}KB)`);
  } catch (e) {
    console.error(`✗  ${path.relative(__dirname, srcPath)}: ${e.message}`);
  }
}

function schedule(srcPath) {
  if (pending.has(srcPath)) clearTimeout(pending.get(srcPath));
  pending.set(srcPath, setTimeout(() => {
    pending.delete(srcPath);
    convert(srcPath);
  }, 300));
}

// fs.watch with recursive works on macOS
const watcher = fs.watch(IMG_DIR, { recursive: true }, (event, filename) => {
  if (!filename) return;
  const ext = path.extname(filename).toLowerCase();
  if (!EXTS.has(ext)) return;

  const fullPath = path.join(IMG_DIR, filename);
  // Make sure the file exists (ignore delete events)
  if (!fs.existsSync(fullPath)) return;

  schedule(fullPath);
});

console.log('👁  Watching img/ for PNG/JPG changes — press Ctrl+C to stop\n');

process.on('SIGINT', () => {
  watcher.close();
  console.log('\nWatcher stopped.');
  process.exit(0);
});
