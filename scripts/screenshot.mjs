#!/usr/bin/env node
/* ===========================================================================
   Screenshot helper.
   ---------------------------------------------------------------------------
   Design work needs looking at, not just building. This renders a route at a
   given size and theme so the result can actually be reviewed.

   The preinstalled Chromium is pinned by executablePath: this environment ships
   build 1194 while the installed Playwright expects a newer one, and without
   the explicit path it tries to download a browser it is not allowed to fetch.

     node scripts/screenshot.mjs <url> <out.png> [width] [height] [light|dark]
   =========================================================================== */

import { chromium } from 'playwright';

const [, , url, out, w = '1440', h = '1000', theme] = process.argv;

if (!url || !out) {
  console.error('usage: node scripts/screenshot.mjs <url> <out.png> [w] [h] [light|dark]');
  process.exit(1);
}

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 2,
});

if (theme) await page.addInitScript((t) => localStorage.setItem('pp_theme', t), theme);

await page.goto(url, { waitUntil: 'networkidle' });
/* Long enough for the hero's ignition sweep to finish and settle. */
await page.waitForTimeout(2200);
await page.screenshot({ path: out, fullPage: false });
await browser.close();

console.log(`wrote ${out}`);
