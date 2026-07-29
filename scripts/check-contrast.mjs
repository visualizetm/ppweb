#!/usr/bin/env node
/* ===========================================================================
   Contrast verifier.
   ---------------------------------------------------------------------------
   Direction B grounds the site in photographic middle grey. Mid-grey has less
   headroom than white or near-black in BOTH directions, so contrast failures
   are the predictable failure mode of this design — not an edge case.

   During the reskin the body-ink value measured 3.91:1 against the ground
   while a comment in index.css claimed 4.6:1. That is exactly the kind of
   error that ships. This script exists so it cannot happen again silently.

   Token values are parsed out of src/index.css rather than duplicated here,
   so editing a colour re-runs against the real value.

     node scripts/check-contrast.mjs
   =========================================================================== */

import { readFile } from 'node:fs/promises';

const CSS_PATH = new URL('../src/index.css', import.meta.url);

/* --- WCAG 2.1 relative luminance ---------------------------------------- */
const channel = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/* --- Pull token values straight out of the stylesheet -------------------- */
async function readTokens() {
  const css = await readFile(CSS_PATH, 'utf8');

  /* Split at the dark-theme selector so the two themes are read separately. */
  const darkStart = css.indexOf("[data-theme='dark']");
  const lightBlock = css.slice(0, darkStart);
  const darkBlock = css.slice(darkStart);

  const parse = (block) => {
    const out = {};
    const re = /(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g;
    let m;
    while ((m = re.exec(block)) !== null) {
      if (!(m[1] in out)) out[m[1]] = m[2].toLowerCase();
    }
    return out;
  };

  const light = parse(lightBlock);
  /* Dark overrides only some tokens; anything it does not restate is shared. */
  const dark = { ...light, ...parse(darkBlock) };
  return { light, dark };
}

/* --- The pairs that must hold ------------------------------------------- *
   `min` is the WCAG threshold. `mustFail` marks a pair that is deliberately
   NOT allowed as text — --primer is a fill colour and asserting that it fails
   as type stops anyone "helpfully" using it for a heading later.            */
const PAIRS = [
  // Body and heading ink on every surface it can legitimately land on.
  { fg: '--ink', bg: '--ground', min: 4.5 },
  { fg: '--ink', bg: '--ground-deep', min: 4.5 },
  { fg: '--ink', bg: '--ground-sunk', min: 4.5 },
  { fg: '--ink', bg: '--panel', min: 4.5 },
  { fg: '--ink', bg: '--panel-high', min: 4.5 },

  { fg: '--ink-soft', bg: '--ground', min: 4.5 },
  { fg: '--ink-soft', bg: '--ground-deep', min: 4.5 },
  { fg: '--ink-soft', bg: '--panel', min: 4.5 },
  { fg: '--ink-soft', bg: '--panel-high', min: 4.5 },

  /* --ink-faint is NOT a text colour. It is for dividers, disabled states and
     iconography, held to the 3:1 non-text threshold. Small mono labels use
     --ink-soft instead — that was the actual bug this file was written to
     catch. Do not raise this to 4.5 and "fix" it by lightening the ground. */
  { fg: '--ink-faint', bg: '--ground', min: 3, nonText: true },
  { fg: '--ink-faint', bg: '--panel', min: 3, nonText: true },
  { fg: '--ink-faint', bg: '--panel-high', min: 3, nonText: true },

  // Primer is a fill. Text on it must pass; it as text must not.
  { fg: '--on-primer', bg: '--primer', min: 4.5 },
  { fg: '--on-primer', bg: '--primer-deep', min: 4.5 },
  { fg: '--primer', bg: '--ground', min: 4.5, mustFail: true },

  /* Filled controls need a 3:1 boundary against the page (WCAG 1.4.11). In
     dark theme the primer fill alone only reaches 1.9:1, so the button carries
     an explicit rim (--primer-edge) and THAT is what satisfies the rule. */
  { fg: '--primer-edge', bg: '--ground', min: 3, nonText: true },

  // Badges are light tint + deep ink; each pairing carries its own text.
  { fg: '--ok-ink', bg: '--ok-tint', min: 4.5 },
  { fg: '--warn-ink', bg: '--warn-tint', min: 4.5 },
  { fg: '--alert-ink', bg: '--alert-tint', min: 4.5 },
  { fg: '--info-ink', bg: '--info-tint', min: 4.5 },
];

const { light, dark } = await readTokens();

let failures = 0;
let checked = 0;

for (const [themeName, tokens] of [
  ['light', light],
  ['dark', dark],
]) {
  console.log(`\n  ${themeName.toUpperCase()}`);

  for (const pair of PAIRS) {
    const fg = tokens[pair.fg];
    const bg = tokens[pair.bg];

    if (!fg || !bg) {
      console.log(`  SKIP  ${pair.fg} on ${pair.bg} — token not resolved to a hex`);
      continue;
    }

    checked += 1;
    const r = contrast(fg, bg);
    const ok = pair.mustFail ? r < pair.min : r >= pair.min;
    if (!ok) failures += 1;

    const label = `${pair.fg} on ${pair.bg}`.padEnd(34);
    const note = pair.mustFail
      ? `must stay under ${pair.min} (fill-only)`
      : pair.nonText
        ? `boundary, need ${pair.min}`
        : `need ${pair.min}`;

    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label} ${r.toFixed(2).padStart(5)}:1  ${note}`);
  }
}

console.log(
  `\n  ${checked} pair(s) checked, ${failures} failure(s)\n`
);

process.exit(failures === 0 ? 0 : 1);
