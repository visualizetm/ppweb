import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getPublishedContent } from './api';
import { DEFAULTS, withDefaults } from '../../shared/content-schema.js';
import { GALLERY_SEED } from '../../shared/gallery-seed.js';
import { FAQ_SEED } from '../../shared/faq-seed.js';

/* ===========================================================================
   Published content.
   ---------------------------------------------------------------------------
   Fetches /api/content once, at the root, and hands published values to every
   page through context.

   DEFAULTS RENDER FIRST, ON PURPOSE. The values baked into the bundle are the
   same words the database is seeded with, so the first paint is correct rather
   than a skeleton, and the site still renders completely if Mongo is
   unreachable. A publish shows up on the next load.
   =========================================================================== */

const BAKED_IN = {
  ...DEFAULTS,
  galleries: { items: GALLERY_SEED },
  faq: { items: FAQ_SEED },
};

const ContentContext = createContext({ content: BAKED_IN, loaded: false });

export function ContentProvider({ children }) {
  const [content, setContent] = useState(BAKED_IN);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ac = new AbortController();

    getPublishedContent(ac.signal).then((res) => {
      if (ac.signal.aborted) return;
      if (res.ok && res.content) {
        /* Merge rather than replace: a section the API has not heard of yet
           keeps its baked-in value instead of vanishing off the page. */
        setContent((prev) => ({ ...prev, ...res.content }));
      }
      setLoaded(true);
    });

    return () => ac.abort();
  }, []);

  const value = useMemo(() => ({ content, loaded }), [content, loaded]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/** Published values for one section, with every missing field filled in. */
export function useContent(sectionId) {
  const { content } = useContext(ContentContext);
  return useMemo(
    () => withDefaults(sectionId, content[sectionId]),
    [content, sectionId]
  );
}

/** True once the network answer has been applied, for the rare place that
    needs to distinguish "no galleries yet" from "not loaded yet". */
export function useContentLoaded() {
  return useContext(ContentContext).loaded;
}

/* ---------------------------------------------------------------------------
   Gallery helpers. The public pages used to import these from
   src/data/galleries; they now derive from published content instead, so the
   same call sites keep working while the source of truth moves to the admin.
   --------------------------------------------------------------------------- */

export function useGalleries() {
  const { items } = useContent('galleries');
  return Array.isArray(items) ? items : [];
}

export function useGallery(slug) {
  const galleries = useGalleries();
  return galleries.find((g) => g.slug === slug) || null;
}

export function useGalleryTypes() {
  const galleries = useGalleries();
  return useMemo(() => ['All', ...new Set(galleries.map((g) => g.type).filter(Boolean))], [galleries]);
}

/* ---------------------------------------------------------------------------
   Pricing. The package and tier STRUCTURE stays in src/data/packages (what is
   included, durations, add-ons); only the numbers are editable, which is the
   part that actually changes. priceFor() falls back to the figure in the data
   file, so an unpriced tier still renders.
   --------------------------------------------------------------------------- */
export function useServicePricing() {
  const c = useContent('services');

  return useMemo(() => {
    const byKey = new Map(
      (Array.isArray(c.prices) ? c.prices : []).map((row) => [row.key, row.priceCents])
    );
    return {
      ...c,
      priceFor: (packageSlug, tierId, fallback) => {
        const key = `${packageSlug}:${tierId}`;
        return byKey.has(key) ? byKey.get(key) : fallback;
      },
    };
  }, [c]);
}

export function useFaqs() {
  const { items } = useContent('faq');
  return Array.isArray(items) ? items : [];
}

/** The one answer promoted to its own section on the home page. */
export function useHomepageFaq() {
  const faqs = useFaqs();
  return faqs.find((f) => f.homepage) || null;
}

export function useFeaturedGalleries(limit = 3) {
  const galleries = useGalleries();
  return useMemo(() => galleries.filter((g) => g.featured).slice(0, limit), [galleries, limit]);
}
