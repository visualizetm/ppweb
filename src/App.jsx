import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DemoBadge from './components/DemoBadge';
import useReveal, { useScrollTop } from './lib/useReveal';

import Home from './pages/Home';

/* Interior pages are split out of the initial bundle. The homepage is the one
   route that must paint fast, so it stays in the main chunk. */
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Gallery = lazy(() => import('./pages/Gallery'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Faq = lazy(() => import('./pages/Faq'));
const Contact = lazy(() => import('./pages/Contact'));
const Booking = lazy(() => import('./pages/Booking'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./pages/admin/Admin'));
const Invoice = lazy(() => import('./pages/Invoice'));

function RouteFallback() {
  return (
    <>
      <div className="rf" role="status" aria-live="polite">
        <span className="sr-only">Loading</span>
        <span className="rf-bar" aria-hidden="true" />
      </div>
      <style>{`
        .rf { display: grid; place-items: center; min-height: 60vh; padding: var(--space-16); }
        .rf-bar {
          width: 120px;
          height: 2px;
          border-radius: 2px;
          background: var(--border-light);
          overflow: hidden;
          position: relative;
        }
        .rf-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          width: 40%;
          background: var(--brand);
          animation: rf-slide 1.1s var(--ease) infinite;
        }
        @keyframes rf-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </>
  );
}

/* ===========================================================================
   Measures the navbar and publishes its height as --nav-h.
   ---------------------------------------------------------------------------
   The nav is a floating pill: its height changes between breakpoints and when
   it enters its scrolled state. Anything that needs to clear it —
   scroll-margin-top on step headings, scroll-padding-top on the document —
   reads --nav-h, so a hardcoded number would drift the moment the nav
   changes. A ResizeObserver keeps it honest.
   =========================================================================== */
function useNavHeight() {
  useEffect(() => {
    const root = document.documentElement;

    const measure = (el) => {
      const h = Math.round(el.getBoundingClientRect().height);
      if (h > 0) root.style.setProperty('--nav-h', `${h}px`);
    };

    const find = () => document.querySelector('.nv .nv-inner') || document.querySelector('.nv');

    let el = find();
    if (!el) {
      /* Admin and invoice routes have no marketing nav at all. */
      root.style.setProperty('--nav-h', '0px');
      return undefined;
    }

    measure(el);
    const ro = new ResizeObserver(() => measure(el));
    ro.observe(el);

    /* The pill also changes height when it solidifies on scroll, which is a
       style change rather than a resize on some engines. */
    const onScroll = () => {
      const next = find();
      if (next && next !== el) {
        ro.unobserve(el);
        el = next;
        ro.observe(el);
      }
      if (el) measure(el);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
}

export default function App() {
  const { pathname } = useLocation();
  useReveal();
  useScrollTop();
  useNavHeight();

  /* The dashboard is a different product from the marketing site and gets none
     of its chrome — no navbar, no footer, no page max-width. */
  const isAdmin = pathname.startsWith('/admin');
  /* An invoice is opened cold from a link. Someone paying is not browsing a
     portfolio, so it gets none of the marketing chrome either. */
  const isInvoice = pathname.startsWith('/invoice');

  if (isAdmin || isInvoice) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/invoice/:token" element={<Invoice />} />
        </Routes>
        <DemoBadge />
      </Suspense>
    );
  }

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:slug" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <DemoBadge />
    </>
  );
}
