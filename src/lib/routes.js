/* ===========================================================================
   Route chunk loaders.
   ---------------------------------------------------------------------------
   Interior pages are code-split (see App.jsx). Each loader here is the same
   import() the lazy route uses, so calling one early warms the module cache
   and the later navigation is instant instead of showing the loading bar.

   The navbar and gallery cards call preloadRoute() on hover, focus and
   touchstart: by the time a finger lifts or a click lands, the chunk is
   usually already here. Nothing is fetched until someone shows intent, so
   the initial page load is exactly as heavy as before.
   =========================================================================== */

export const loaders = {
  '/portfolio': () => import('../pages/Portfolio'),
  '/portfolio/:slug': () => import('../pages/Gallery'),
  '/about': () => import('../pages/About'),
  '/services': () => import('../pages/Services'),
  '/faq': () => import('../pages/Faq'),
  '/contact': () => import('../pages/Contact'),
  '/booking': () => import('../pages/Booking'),
};

const warmed = new Set();

/** Starts loading the chunk for a path. Safe to call repeatedly. */
export function preloadRoute(path) {
  const clean = String(path || '').split(/[?#]/)[0];
  const key = /^\/portfolio\/[^/]+$/.test(clean) ? '/portfolio/:slug' : clean;
  const load = loaders[key];
  if (!load || warmed.has(key)) return;
  warmed.add(key);
  load().catch(() => warmed.delete(key));
}

/** Event handlers to spread onto a Link, preloading its target on intent. */
export function preloadOn(path) {
  const go = () => preloadRoute(path);
  return { onPointerEnter: go, onFocus: go, onTouchStart: go };
}
