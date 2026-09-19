import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { prefersReduced } from '../lib/useReveal';

/* ===========================================================================
   Page transition.
   ---------------------------------------------------------------------------
   A short fade between routes, and the scroll reset that goes with it.

   On a link click the outgoing page fades for --duration-fast. While it is
   invisible the window is scrolled to the top in one step, then the new
   location renders and rises in over --duration. The viewer sees a soft
   cut, never a jump, and never the previous page's scroll position.

   WHY THE SCROLL IS INSTANT AND NOT ANIMATED

   The stylesheet sets `scroll-behavior: smooth` on <html>, which is right for
   in-page anchor links. It also means a scrollTo() with behavior 'auto'
   animates. The old route-change reset did exactly that, and the animation
   raced the code-split chunk: the chunk arrived mid-scroll, the document
   changed height under it, and the scroll stopped 20 to 90px short of the
   top. That was measured, not guessed (scratch test scroll-probe.mjs). An
   explicit 'instant' scroll ignores the CSS setting and cannot be
   interrupted, and because it runs while the page is at opacity 0 it is not
   seen anyway.

   Under prefers-reduced-motion there is no fade at all: the new page shows at
   once, already scrolled to the top. In-page hash links are left alone.

   Rendering `children(location)` with a HELD location, rather than letting
   <Routes> read the live one, is what keeps the old page on screen during
   its fade.
   =========================================================================== */

const LEAVE_MS = 200; /* --duration-fast */

const routeKey = (loc) => loc.pathname + loc.search;

export default function PageTransition({ children }) {
  const location = useLocation();
  const [shown, setShown] = useState(location);
  const [leaving, setLeaving] = useState(false);
  const latest = useRef(location);
  latest.current = location;

  useEffect(() => {
    if (routeKey(location) === routeKey(shown)) {
      /* Only the hash moved: an in-page anchor. Nothing to transition. */
      if (location !== shown) setShown(location);
      return undefined;
    }

    const toTop = () => {
      if (!latest.current.hash && window.scrollY > 0) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    };

    const settle = () => {
      toTop();
      setShown(latest.current);
      setLeaving(false);
      /* A smooth scroll that was already in flight when the link was clicked
         (an anchor link, a focus) can carry on past the reset. Re-assert once
         the new page has laid out; by then anything in flight has been
         cancelled and this is a no-op in the normal case. */
      requestAnimationFrame(toTop);
      setTimeout(toTop, 100);
    };

    if (prefersReduced()) {
      settle();
      return undefined;
    }

    setLeaving(true);
    const t = setTimeout(settle, LEAVE_MS);
    return () => clearTimeout(t);
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div key={routeKey(shown)} className={`pt ${leaving ? 'pt-leave' : 'pt-enter'}`}>
      {children(shown)}
    </div>
  );
}
