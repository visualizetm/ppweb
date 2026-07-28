import { useEffect } from 'react';
import { site } from '../data/site';

/* ===========================================================================
   Per-route document metadata.
   ---------------------------------------------------------------------------
   No helmet dependency — this is a handful of DOM writes and the app is a
   single client-side render. The robots noindex tag for demo builds is handled
   at BUILD time in vite.config.js instead of here, so production HTML never
   contains it at all.
   =========================================================================== */

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [, name] = selector.match(/\[(?:name|property)="([^"]+)"\]/) || [];
    if (!name) return;
    el.setAttribute(selector.includes('property=') ? 'property' : 'name', name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export default function Seo({ title, description, image }) {
  const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.tagline}`;
  const desc = description || site.metaDescription;

  useEffect(() => {
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', desc);
    if (image) setMeta('meta[property="og:image"]', 'content', image);
  }, [fullTitle, desc, image]);

  return null;
}
