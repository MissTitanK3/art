#!/usr/bin/env node
/**
 * Generate solid-color Apple splash/launch images (and icons) for every region app.
 *
 * Usage:
 *   node scripts/generate-apple-splash.mjs
 *
 * Creates PNGs under each `apps/<region>/public/splash` folder that match the sizes referenced in metadata.
 */
import { promises as fs } from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple CRC32 implementation
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return ~c >>> 0;
}

function writeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([t, data]));
  crc.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, t, data, crc]);
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function createSolidPng(width, height, hexColor) {
  const { r, g, b } = hexToRgb(hexColor);
  const signature = Buffer.from([137,80,78,71,13,10,26,10]); // PNG sig

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: Truecolor RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = writeChunk('IHDR', ihdr);

  // Image data (unfiltered scanlines, filter=0 per row)
  const rowSize = 1 + 3 * width; // filter byte + RGB per pixel
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    raw[offset] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const p = offset + 1 + x * 3;
      raw[p] = r; raw[p + 1] = g; raw[p + 2] = b;
    }
  }
  const compressed = zlib.deflateSync(raw);
  const idatChunk = writeChunk('IDAT', compressed);

  const iendChunk = writeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const regions = [
  'apps/region-template',
  'apps/region-pnw',
  'apps/region-norcal',
  'apps/region-wap',
  'apps/region-socal',
  'apps/watch',
];

// Sizes referenced in app/head.tsx link tags
const sizes = [
  [2048,2732],[2732,2048],
  [1668,2388],[2388,1668],
  [1290,2796],[2796,1290],
  [1179,2556],[2556,1179],
  [1284,2778],[2778,1284],
  [1170,2532],[2532,1170],
  [1125,2436],[2436,1125],
  [1242,2688],[2688,1242],
  [828,1792],[1792,828],
  [750,1334],[1334,750],
  [640,1136],[1136,640],
];

// Use the dark hex we applied in manifests; close to requested oklch tone
const hex = '#0f1115';

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  for (const region of regions) {
    const splashDir = path.join(region, 'public', 'splash');
    await ensureDir(splashDir);
    for (const [w,h] of sizes) {
      const file = path.join(splashDir, `apple-splash-${w}-${h}.png`);
      const png = createSolidPng(w, h, hex);
      await fs.writeFile(file, png);
    }
    // Ensure icon.png (32x32) exists to satisfy metadata icons
    const icon32 = createSolidPng(32, 32, hex);
    await fs.writeFile(path.join(region, 'public', 'icon.png'), icon32);
  }
  console.log('Generated splash images for regions into public/splash.');
}

main().catch((e) => { console.error(e); process.exit(1); });
