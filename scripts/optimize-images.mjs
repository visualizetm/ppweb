#!/usr/bin/env node
/* ===========================================================================
   Image optimiser.
   ---------------------------------------------------------------------------
   Photography is the product on this site, so images get shipped at the
   smallest size that still looks right — never straight off the camera.

   Usage:
     node scripts/optimize-images.mjs <source-dir> <output-dir> [--width 2000]

   Produces, for every image found in <source-dir>:
     <name>.jpg       progressive JPEG, mozjpeg, quality 80  (universal fallback)
     <name>.webp      WebP, quality 78                       (~30% smaller)
     <name>-thumb.jpg 640px wide                             (grid thumbnails)

   Re-run this whenever Michael sends new originals. It is idempotent and never
   touches the source files.
   =========================================================================== */

import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const EXT = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp']);
const FULL_WIDTH_DEFAULT = 2000;
const THUMB_WIDTH = 640;

const [, , srcArg, outArg, ...rest] = process.argv;

if (!srcArg || !outArg) {
  console.error('usage: node scripts/optimize-images.mjs <source-dir> <output-dir> [--width N]');
  process.exit(1);
}

const widthFlagIndex = rest.indexOf('--width');
const FULL_WIDTH =
  widthFlagIndex !== -1 ? Number(rest[widthFlagIndex + 1]) || FULL_WIDTH_DEFAULT : FULL_WIDTH_DEFAULT;

const fmtBytes = (n) => `${(n / 1024 / 1024).toFixed(2)}MB`;

async function run() {
  await mkdir(outArg, { recursive: true });

  const entries = await readdir(srcArg, { withFileTypes: true });
  const images = entries
    .filter((e) => e.isFile() && EXT.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort();

  if (!images.length) {
    console.log(`no images found in ${srcArg}`);
    return;
  }

  let before = 0;
  let after = 0;

  for (const name of images) {
    const srcPath = path.join(srcArg, name);
    const base = path.basename(name, path.extname(name));

    const srcStat = await stat(srcPath);
    before += srcStat.size;

    const input = sharp(srcPath, { failOn: 'none' }).rotate(); // honour EXIF orientation
    const meta = await input.metadata();
    const targetWidth = Math.min(FULL_WIDTH, meta.width || FULL_WIDTH);

    const jpgPath = path.join(outArg, `${base}.jpg`);
    const webpPath = path.join(outArg, `${base}.webp`);
    const thumbPath = path.join(outArg, `${base}-thumb.jpg`);

    await sharp(srcPath, { failOn: 'none' })
      .rotate()
      .resize({ width: targetWidth, withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(jpgPath);

    await sharp(srcPath, { failOn: 'none' })
      .rotate()
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(webpPath);

    await sharp(srcPath, { failOn: 'none' })
      .rotate()
      .resize({ width: Math.min(THUMB_WIDTH, meta.width || THUMB_WIDTH), withoutEnlargement: true })
      .jpeg({ quality: 74, progressive: true, mozjpeg: true })
      .toFile(thumbPath);

    const outStat = await stat(jpgPath);
    const webpStat = await stat(webpPath);
    after += outStat.size + webpStat.size;

    console.log(
      `  ${name.padEnd(18)} ${String(meta.width).padStart(5)}px -> ${String(targetWidth).padStart(5)}px   ` +
        `${fmtBytes(srcStat.size).padStart(8)} -> ${fmtBytes(outStat.size).padStart(8)} jpg  ` +
        `${fmtBytes(webpStat.size).padStart(8)} webp`
    );
  }

  console.log(
    `\n${images.length} image(s)   ${fmtBytes(before)} in   ${fmtBytes(after)} out   ` +
      `(${Math.round((1 - after / before) * 100)}% smaller)`
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
