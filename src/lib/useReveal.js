import { useEffect } from 'react';

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

   HOW NEW ELEMENTS ARE FOUND

   A MutationObserver on <body> notices when the DOM gains nodes and hands any
   new reveal or parallax elements to the observers above. This replaced a
   60ms timer that ran once per route change. That timer was the cause of the
   "page looks empty until I reload" bug: interior pages are code-split, and
   on a real connection their chunk arrives well after 60ms, so their
   sections rendered after the sweep, were never observed, and sat at
   opacity 0 for good. A reload put the chunk in the HTTP cache, the sweep
   then won the race, and the bug looked like it had gone away. Watching the
   DOM instead of the clock means it does not matter when content arrives:
   from a chunk, from the content API, or from a filter click.

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
   - The mutation callback does one querySelectorAll, coalesced to a frame,
     and only when the DOM actually changed. Scrolling changes nothing.
   - Everything is disabled outright under prefers-reduced-motion.
   =========================================================================== */

const REVEAL_SELECTOR = '[data-reveal]';
const PARALLAX_SELECTOR = '[data-parallax]';

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function useReveal() {
  useEffect(() => {
    if (prefersReduced()) {
      /* The stylesheet already forces these visible under reduced motion; the
         attribute keeps anything that reads it (tests, styles) consistent. */
      const mark = () =>
        document
          .querySelectorAll(`${REVEAL_SELECTOR}:not([data-revealed]), ${PARALLAX_SELECTOR}:not([data-revealed])`)
          .forEach((el) => el.setAttribute('data-revealed', ''));
      mark();
      const mo = new MutationObserver(mark);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    /* ---------------------------------------------------------- reveal --- */
    /* An element reveals once 12% of it is on screen, OR once REVEAL_PX of
       it is, whichever comes first. The pixel floor is for tall containers:
       on a phone the portfolio grid is 3500px tall, so 12% is 420px, and its
       first card sat fully on screen at opacity 0 until the visitor had
       scrolled another 130px. The extra low thresholds are what let the
       observer fire early enough to apply the pixel rule. */
    const REVEAL_PX = 96;
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (entry.intersectionRatio < 0.12 && entry.intersectionRect.height < REVEAL_PX) continue;
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
      /* No bottom inset on the root: with one, a pricing card showing its
         top 135px on arrival counted as 69px and stayed hidden. */
      { threshold: [0, 0.02, 0.05, 0.12], rootMargin: '0px' }
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
          if (entry.isIntersecting && el.isConnected) {
            parallaxEls.add(el);
            el.style.willChange = 'transform';
            attachScroll();
          } else {
            parallaxEls.delete(el);
            el.style.willChange = '';
            el.style.transform = '';
            if (!el.isConnected) parallaxObserver.unobserve(el);
            detachScroll();
          }
        }
        update();
      },
      { rootMargin: '20% 0px 20% 0px' }
    );

    /* ----------------------------------------------------- discovery ----- */
    /* Everything already in the DOM, then everything that arrives later. A
       WeakSet stops an element being handed to an observer twice; it holds
       no strong reference, so removed pages are garbage collected as normal. */
    const seen = new WeakSet();
    let sweepFrame = 0;

    const sweep = () => {
      sweepFrame = 0;
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        if (seen.has(el) || el.hasAttribute('data-revealed')) return;
        seen.add(el);
        revealObserver.observe(el);
      });
      document.querySelectorAll(PARALLAX_SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        parallaxObserver.observe(el);
      });
    };

    const requestSweep = () => {
      if (sweepFrame) return;
      sweepFrame = requestAnimationFrame(sweep);
    };

    sweep();
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.addedNodes.length) { requestSweep(); return; }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      if (sweepFrame) cancelAnimationFrame(sweepFrame);
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      revealObserver.disconnect();
      parallaxObserver.disconnect();
    };
  }, []);
}
