import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* ===========================================================================
   Scroll behaviour.
   ---------------------------------------------------------------------------
   Two systems, both built to stay off the main thread.

   1. REVEAL — one IntersectionObserver for the whole app. Elements opt in with
      a data attribute and are unobserved the moment they fire, so the observer
      shrinks as you scroll rather than growing.

        <div data-reveal>              fade + rise
        <div data-reveal="slide-left">  enters from the left
        <div data-reveal="slide-right">
        <div data-reveal="scale">       settles in from 96%
        <div data-reveal="stagger">     children cascade
        <div data-reveal data-reveal-delay="120">

   2. PARALLAX — elements with data-parallax drift as they cross the viewport.

   WHY IT DOES NOT CAUSE SCROLL LAG

   - Only `transform` and `opacity` are animated. Both are composited; neither
     triggers layout or paint, so the work happens off the main thread.
   - Nothing measures geometry during scroll. Parallax positions come from the
     IntersectionObserver entry, and the only per-frame work is writing a
     transform inside requestAnimationFrame.
   - The scroll listener is passive, so it can never block scrolling, and it is
     only attached while at least one parallax element is actually on screen.
   - `will-change` is added when an element starts animating and REMOVED when
     it finishes. Leaving it on permanently is the classic cause of a site that
     scrolls fine at first and degrades — each layer costs GPU memory.
   - Everything is disabled outright under prefers-reduced-motion.
   =========================================================================== */

const REVEAL_SELECTOR = '[data-reveal]';
const PARALLAX_SELECTOR = '[data-parallax]';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (prefersReduced()) {
      document
        .querySelectorAll(`${REVEAL_SELECTOR}, ${PARALLAX_SELECTOR}`)
        .forEach((el) => el.setAttribute('data-revealed', ''));
      return undefined;
    }

    /* ---------------------------------------------------------- reveal --- */
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;

          const delay = Number(el.dataset.revealDelay || 0);
          el.style.willChange = 'transform, opacity';

          const fire = () => {
            el.setAttribute('data-revealed', '');
            /* Drop the compositor hint once the transition is done, so long
               pages do not accumulate dozens of promoted layers. */
            const clear = () => {
              el.style.willChange = '';
              el.removeEventListener('transitionend', clear);
            };
            el.addEventListener('transitionend', clear);
            setTimeout(clear, 1200);
          };

          if (delay) setTimeout(fire, delay);
          else fire();

          revealObserver.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    /* -------------------------------------------------------- parallax --- */
    const parallaxEls = new Set();
    let frame = 0;
    let listening = false;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of parallaxEls) {
        /* getBoundingClientRect here is a read on a small, bounded set — only
           elements currently intersecting — and it happens once per frame
           inside rAF, before any writes. */
        const rect = el.getBoundingClientRect();
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        const depth = Number(el.dataset.parallax) || 12;
        el.style.transform = `translate3d(0, ${(-progress * depth).toFixed(2)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const attachScroll = () => {
      if (listening || parallaxEls.size === 0) return;
      window.addEventListener('scroll', onScroll, { passive: true });
      listening = true;
    };

    const detachScroll = () => {
      if (!listening || parallaxEls.size > 0) return;
      window.removeEventListener('scroll', onScroll);
      listening = false;
    };

    const parallaxObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target;
          if (entry.isIntersecting) {
            parallaxEls.add(el);
            el.style.willChange = 'transform';
            attachScroll();
          } else {
            parallaxEls.delete(el);
            el.style.willChange = '';
            el.style.transform = '';
            detachScroll();
          }
        }
        update();
      },
      { rootMargin: '20% 0px 20% 0px' }
    );

    /* Timeout, not immediate: on a route change React has updated the location
       but has not necessarily committed the new tree yet. */
    const timer = setTimeout(() => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        if (!el.hasAttribute('data-revealed')) revealObserver.observe(el);
      });
      document.querySelectorAll(PARALLAX_SELECTOR).forEach((el) => {
        parallaxObserver.observe(el);
      });
    }, 60);

    return () => {
      clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      revealObserver.disconnect();
      parallaxObserver.disconnect();
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
