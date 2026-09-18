/* ===========================================================================
   Routing check.
   ---------------------------------------------------------------------------
   Asserts that every endpoint in the API dispatcher is actually reachable
   through the rules in vercel.json, using only filesystem routing behaviour
   that is guaranteed for a plain (non framework) project.

   WHY THIS EXISTS
   The API was once a single function named api/[...route].js. A bracketed
   catch-all filename is a Next.js convention; on a plain Vite project Vercel
   did not resolve /api/admin/login to it. Every API request 404'd with an HTML
   error page, the browser could not parse it as JSON, and the dashboard showed
   a generic "Something went wrong" for what looked like a password problem.

   The build was green and every other test passed, because the tests called
   the handlers directly and assumed the platform had already routed to them.
   This check is the thing that would have caught it.

     node scripts/check-routing.mjs
   =========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));

let failures = 0;
const pass = (m) => console.log(`  ok    ${m}`);
const fail = (m) => { failures += 1; console.log(`  FAIL  ${m}`); };

/* --- what Vercel turns into functions ----------------------------------- */
function functionRoutes() {
  const out = [];
  const walk = (dir, prefix) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('_')) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, `${prefix}/${e.name}`);
      else if (e.name.endsWith('.js')) out.push(`${prefix}/${e.name.replace(/\.js$/, '')}`);
    }
  };
  walk(path.join(ROOT, 'api'), '/api');
  return out;
}

/* Only exact filenames are treated as routable. Anything that needs bracket
   interpretation is deliberately NOT credited, because that is the assumption
   that broke production. */
const ROUTES = functionRoutes();
const resolves = (p) => ROUTES.includes(p) || ROUTES.includes(`${p}/index`);

/* --- vercel.json source matching ---------------------------------------- */
function matchSource(source, pathname) {
  if (/[()?!*+]/.test(source) && !source.includes(':')) {
    return new RegExp(`^${source}$`).test(pathname) ? {} : null;
  }
  const keys = [];
  const pattern = source
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\/:([A-Za-z0-9_]+)\*/g, (_m, k) => { keys.push(k); return '(?:/(.*))?'; })
    .replace(/:([A-Za-z0-9_]+)/g, (_m, k) => { keys.push(k); return '([^/]+)'; });
  const m = new RegExp(`^${pattern}$`).exec(pathname);
  if (!m) return null;
  return Object.fromEntries(keys.map((k, i) => [k, m[i + 1] ?? '']));
}

/** Where does a request for `pathname` end up? */
function resolveRequest(pathname) {
  if (resolves(pathname)) return { kind: 'function', route: pathname };

  for (const rw of config.rewrites || []) {
    const params = matchSource(rw.source, pathname);
    if (!params) continue;
    const dest = rw.destination.replace(/:([A-Za-z0-9_]+)/g, (_m, k) => params[k] ?? '');
    const destPath = dest.split('?')[0];
    if (resolves(destPath)) return { kind: 'function', route: destPath, via: rw.source };
    if (destPath === '/index.html') return { kind: 'spa' };
  }
  return { kind: 'notfound' };
}

/* --- the endpoints the dispatcher claims to serve ------------------------ */
const dispatcher = fs.readFileSync(path.join(ROOT, 'api/index.js'), 'utf8');
const declared = [...dispatcher.matchAll(/^\s*'([a-z0-9/-]+)':\s/gim)].map((m) => m[1]);

console.log('==> api routing');

if (!declared.length) {
  fail('could not read the ROUTES map out of api/index.js');
} else {
  pass(`dispatcher declares ${declared.length} endpoints`);
}

for (const endpoint of declared) {
  const pathname = `/api/${endpoint}`;
  const r = resolveRequest(pathname);
  if (r.kind !== 'function') {
    fail(`${pathname} does not reach a function (${r.kind}). A request here would 404 with an HTML page.`);
  }
}
if (declared.length && !failures) {
  pass('every declared endpoint reaches a function without relying on bracket filenames');
}

/* Nothing under /api may fall through to the SPA, or an API call would get
   index.html with a 200 and fail to parse as JSON. */
for (const probe of ['/api/admin/login', '/api/content', '/api/nope/deeper']) {
  const r = resolveRequest(probe);
  if (r.kind === 'spa') fail(`${probe} falls through to the SPA rewrite`);
}
if (!failures) pass('no /api path falls through to the SPA rewrite');

/* Bracketed filenames must not be relied on anywhere. */
const bracketed = ROUTES.filter((r) => /\[|\]/.test(r));
if (bracketed.length) {
  fail(`bracketed function filename(s) present, which a plain Vite project does not route: ${bracketed.join(', ')}`);
} else {
  pass('no function depends on bracket filename routing');
}

console.log('');
console.log(failures ? `routing: ${failures} failure(s)` : 'routing: all checks passed');
process.exit(failures ? 1 : 0);
