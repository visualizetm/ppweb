#!/usr/bin/env node
/* ===========================================================================
   Horizontal-overflow assertion.
   ---------------------------------------------------------------------------
   Asserts, for every route and every breakpoint:

       document.documentElement.scrollWidth <= clientWidth + 1

   and names the offending element when it fails.

   WHY THIS EXISTS

   The booking date step shipped 1478px wide inside a 390px viewport. The cause
   was a <fieldset> — which carries min-width: min-content from the UA
   stylesheet — refusing to shrink around a horizontal scroller, so 21 date
   cards dragged the whole document sideways.

   It went unnoticed because an earlier `overflow-x: clip` on html/body was
   hiding it. That is also why there is NO clip on the page any more: a clip
   makes scrollWidth equal clientWidth by definition, so it would render this
   check permanently green and useless. The page is genuinely narrow instead.

   Routes are derived from App.jsx at runtime so this cannot go stale.
   320 is included deliberately: it is the floor, and overflow shows there first.

     node scripts/check-overflow.mjs [baseUrl]
   =========================================================================== */

import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://127.0.0.1:4399';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const WIDTHS = (process.env.OVERFLOW_WIDTHS || "320,390,768,1440").split(",").map(Number);

async function routes() {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const found = [...app.matchAll(/path="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((r) => r !== '*')
    .map((r) => r.replace(/\/\*$/, ''))
    /* Params become a real value so the page renders rather than 404ing. */
    .map((r) => r.replace(/\/:[^/]+/g, '/solo-shoot-101125'));
  return [...new Set(found)];
}

/** Reports the outermost element sticking past the right edge. */
const PROBE = () => {
  const de = document.documentElement;
  const w = de.clientWidth;
  const delta = de.scrollWidth - w;
  if (delta <= 1) return null;

  const offenders = [...document.querySelectorAll('*')]
    .filter((el) => {
      /* Off-canvas panels are translated out of view on purpose. */
      if (el.closest('.nv-drawer')) return false;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed') return false;
      return el.getBoundingClientRect().right > w + 1;
    })
    .map((el) => {
      let depth = 0;
      let n = el;
      while (n.parentElement) {
        depth += 1;
        n = n.parentElement;
      }
      return {
        depth,
        tag: el.tagName,
        cls: (el.className || '').toString().slice(0, 44),
        right: Math.round(el.getBoundingClientRect().right),
        minWidth: getComputedStyle(el).minWidth,
      };
    })
    .sort((a, b) => a.depth - b.depth);

  return { delta, worst: offenders[0] || null, count: offenders.length };
};

const browser = await chromium.launch({ executablePath: CHROME });
let failures = 0;
let checks = 0;

const report = (label, width, result) => {
  checks += 1;
  if (!result) return;
  failures += 1;
  const w = result.worst;
  console.log(
    `  FAIL  ${String(width).padStart(4)}px  ${label.padEnd(34)} +${result.delta}px` +
      (w ? `  <- ${w.tag}.${w.cls} (min-width: ${w.minWidth})` : '')
  );
};

const list = await routes();

for (const width of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width, height: 844 },
    isMobile: width < 768,
    hasTouch: width < 768,
  });
  const page = await ctx.newPage();

  for (const route of list) {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);
    report(route, width, await page.evaluate(PROBE));
  }

  /* The wizard is the whole reason this exists, so drive every step rather
     than testing only the intro screen. */
  await page.goto(`${BASE}/booking`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(250);
  await page.getByRole('button', { name: /^Start/ }).click();
  await page.waitForTimeout(200);

  const steps = ['shoot', 'car', 'when', 'wants', 'you', 'review'];
  for (const step of steps) {
    if (step === 'shoot') await page.getByRole('button', { name: /Solo/ }).first().click();
    if (step === 'when') {
      const d = page.locator('.bk-date:not([disabled])').first();
      if (await d.count()) await d.click();
      await page.waitForTimeout(400);
      /* Picking a date without a time is an invalid state by design, so
         choose a slot — otherwise validation blocks and later steps never
         get measured. */
      const slot = page.locator('.bk-slot').first();
      if (await slot.count()) await slot.click();
      else await page.locator('.bk-check input').check();
      await page.waitForTimeout(200);
    }
    if (step === 'you') {
      await page.locator('#f-name').fill('Casey Moreno');
      await page.locator('#f-email').fill('casey@example.com');
    }
    await page.waitForTimeout(250);
    report(`booking step: ${step}`, width, await page.evaluate(PROBE));

    const next = page.getByRole('button', { name: /Continue/ });
    if (await next.count()) {
      await next.click();
      await page.waitForTimeout(300);
    }
  }

  await ctx.close();
  console.log(`  ${String(width).padStart(4)}px  ${list.length + steps.length} view(s) checked`);
}

await browser.close();

console.log(`\n  ${checks} check(s), ${failures} overflow failure(s)\n`);
process.exit(failures === 0 ? 0 : 1);
