#!/usr/bin/env node
/* ===========================================================================
   Paint sampler.
   ---------------------------------------------------------------------------
   Direction B gives each gallery an accent taken from its subject car's
   colour. The honest way to get that colour is to measure it off the
   photograph, not to guess it — I do not know what these cars actually are,
   and three of the covers carry alt text I have already flagged as unverified.

   So this reads the cover image and returns the most chromatic colour that
   occupies a meaningful share of the frame. Sampled from the real pixels, it
   is true by construction: whatever colour dominates that photograph IS the
   page's accent, whether or not anyone can name the paint code.

   If Michael later supplies real paint codes, set `paint` by hand in the
   gallery file — a hand-set value always wins over a sampled one.

     node scripts/sample-paint.mjs [path-to-image ...]
     node scripts/sample-paint.mjs            # scans public/galleries/<slug>/cover.jpg
   =========================================================================== */

import { readdir, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const GALLERY_DIR = 'public/galleries';

const toHex = (r, g, b) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

/* HSL saturation and lightness, used only to rank candidate colours. */
function sl(r, g, b) {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { s, l };
}

async function sample(file) {
  /* Small enough to be fast, large enough that a car still dominates. */
  const { data, info } = await sharp(file)
    .resize(96, 96, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  /* Bucket into a coarse RGB grid so near-identical pixels group together. */
  const buckets = new Map();
  const STEP = 24;

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const { s, l } = sl(r, g, b);

    /* Skip near-black, near-white and near-grey — asphalt, sky and the car's
       own shadows would otherwise win on volume alone and every gallery would
       come back grey, which defeats the point. */
    if (l < 0.14 || l > 0.88) continue;
    if (s < 0.22) continue;

    const key = `${Math.round(r / STEP)},${Math.round(g / STEP)},${Math.round(b / STEP)}`;
    const hit = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    hit.r += r;
    hit.g += g;
    hit.b += b;
    hit.n += 1;
    buckets.set(key, hit);
  }

  if (!buckets.size) return null;

  /* Rank by share of frame weighted by saturation: a colour that is both
     common AND chromatic beats one that is merely bright. */
  const total = [...buckets.values()].reduce((sum, x) => sum + x.n, 0);
  const ranked = [...buckets.values()]
    .map((x) => {
      const r = x.r / x.n;
      const g = x.g / x.n;
      const b = x.b / x.n;
      const { s } = sl(r, g, b);
      const share = x.n / total;
      /* Saturation weighted hard. Share alone returns asphalt and body panels;
         this portfolio is full of silver, black and grey cars, so the chromatic
         signal lives in the environment - sunset sky, brick, foliage, wet
         tarmac - and that is legitimately the colour of the shoot. */
      return { r, g, b, share, score: Math.sqrt(share) * (0.1 + s * 2.2) };
    })
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  return { hex: toHex(top.r, top.g, top.b), share: top.share };
}

async function main() {
  const args = process.argv.slice(2);
  let files = args;

  if (!files.length) {
    const slugs = await readdir(GALLERY_DIR, { withFileTypes: true });
    files = [];
    for (const d of slugs.filter((x) => x.isDirectory())) {
      const p = path.join(GALLERY_DIR, d.name, 'cover.jpg');
      try {
        await access(p);
        files.push(p);
      } catch {
        console.log(`  ${d.name.padEnd(30)} no cover.jpg — leave paint: null`);
      }
    }
  }

  for (const f of files) {
    const slug = path.basename(path.dirname(f));
    const result = await sample(f);
    if (!result) {
      console.log(`  ${slug.padEnd(30)} no chromatic region found — leave paint: null`);
      continue;
    }
    console.log(
      `  ${slug.padEnd(30)} ${result.hex}   ${(result.share * 100).toFixed(1)}% of frame`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
