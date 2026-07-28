import { Suspense, lazy } from 'react';
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
const Book = lazy(() => import('./pages/Book'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./pages/admin/Admin'));

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

export default function App() {
  const { pathname } = useLocation();
  useReveal();
  useScrollTop();

  /* The dashboard is a different product from the marketing site and gets none
     of its chrome — no navbar, no footer, no page max-width. */
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
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
            <Route path="/book" element={<Book />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <DemoBadge />
    </>
  );
}
