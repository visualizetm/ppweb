import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* ===========================================================================
   One IntersectionObserver for the whole app.
   ---------------------------------------------------------------------------
   Watches .reveal / .reveal-left / .reveal-right / .stagger, adds .is-visible
   once, then unobserves — the animation is a one-shot entrance, not a state
   that toggles as you scroll back up.

   Re-attaches after every route change on a short timeout, because the new
   route's nodes do not exist yet at the moment the location updates.
   =========================================================================== */

const SELECTOR = '.reveal, .reveal-left, .reveal-right, .stagger';

export default function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    /* Respect the OS setting. The CSS already neutralises the transforms, but
       without this the observer still runs on every scroll for no reason. */
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      document.querySelectorAll(SELECTOR).forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    /* Timeout, not immediate: on a route change React has updated the location
       but has not necessarily committed the new tree yet. */
    const timer = setTimeout(() => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (!el.classList.contains('is-visible')) observer.observe(el);
      });
    }, 60);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);
}

/** Scrolls to top on route change, but leaves in-page hash links alone. */
export function useScrollTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);
}
