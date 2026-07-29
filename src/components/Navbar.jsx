import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Menu01 from '@untitled-ui/icons-react/build/esm/Menu01';
import XClose from '@untitled-ui/icons-react/build/esm/XClose';

import Wordmark from './Wordmark';
import ThemeToggle from './ThemeToggle';
import { navLinks } from '../data/site';

/* ===========================================================================
   Navbar.
   ---------------------------------------------------------------------------
   A flat bar, not a floating translucent pill. The previous version was a
   glass capsule with a 24px backdrop-filter — glassmorphism, and one of the
   defaults this rebuild is written against.

   Here the bar sits ON the grey card: opaque, hairline rule beneath, a real
   edge that hardens once you scroll past it. Nothing floats and nothing is
   blurred.
   =========================================================================== */

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header className={`nv ${scrolled ? 'nv-scrolled' : ''}`}>
        <nav className="wrap nv-inner" aria-label="Main">
          <Wordmark size="sm" />

          <ul className="nv-links">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => `nv-link ${isActive ? 'nv-link-on' : ''}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nv-actions">
            <ThemeToggle />
            <Link to="/booking" className="btn btn-primary btn-sm nv-cta">
              Book a shoot
            </Link>
            <button
              type="button"
              className="nv-burger"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="nv-drawer"
            >
              <Menu01 width={20} height={20} aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`nv-scrim ${open ? 'nv-scrim-on' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="nv-drawer"
        className={`nv-drawer ${open ? 'nv-drawer-on' : ''}`}
        aria-label="Menu"
        aria-hidden={!open}
        {...(!open ? { inert: '' } : {})}
      >
        <div className="nv-drawer-top">
          <Wordmark size="sm" />
          <button type="button" className="nv-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <XClose width={20} height={20} aria-hidden="true" />
          </button>
        </div>

        <ul className="nv-drawer-links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => `nv-drawer-link ${isActive ? 'nv-drawer-link-on' : ''}`}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <Link to="/booking" className="btn btn-primary nv-drawer-cta">
          Book a shoot
        </Link>
      </aside>

      <style>{`
        .nv {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--ground);
          border-bottom: 1px solid transparent;
          transition: border-color var(--duration) var(--ease),
            box-shadow var(--duration) var(--ease);
        }

        .nv-scrolled {
          border-bottom-color: var(--edge-strong);
          box-shadow: var(--lift-1);
        }

        .nv-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-6);
          padding-block: var(--space-4);
        }

        .nv-links {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nv-link {
          display: block;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          color: var(--ink-soft);
          font-size: 0.875rem;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          transition: color var(--duration-fast) var(--ease),
            border-color var(--duration-fast) var(--ease);
        }

        .nv-link:hover { color: var(--ink); }

        /* Active state is a stamped underline, not a filled capsule. */
        .nv-link-on {
          color: var(--ink);
          font-weight: 600;
          border-bottom-color: var(--ink);
        }

        .nv-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .nv-burger,
        .nv-close {
          display: none;
          place-items: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius);
          border: 1px solid var(--edge-strong);
          background: var(--panel);
          color: var(--ink);
        }

        .nv-close { display: grid; }
        .nv-burger:hover, .nv-close:hover { background: var(--panel-high); }

        /* --- drawer --- */
        .nv-scrim {
          position: fixed;
          inset: 0;
          z-index: 110;
          background: rgba(12, 13, 16, 0.55);
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--duration) var(--ease);
        }

        .nv-scrim-on { opacity: 1; pointer-events: auto; }

        .nv-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          z-index: 120;
          width: min(320px, 86vw);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          padding: var(--space-5);
          background: var(--ground-deep);
          border-left: 1px solid var(--edge-strong);
          transform: translateX(100%);
          transition: transform var(--duration) var(--ease);
          overflow-y: auto;
        }

        .nv-drawer-on { transform: translateX(0); }

        .nv-drawer-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nv-drawer-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        .nv-drawer-link {
          display: block;
          padding: var(--space-4) var(--space-1);
          border-bottom: 1px solid var(--edge-hair);
          color: var(--ink-soft);
          font-family: var(--font-display);
          font-variation-settings: 'wdth' var(--wdth-plate);
          font-weight: 700;
          font-size: 1.25rem;
          text-transform: uppercase;
          transition: color var(--duration-fast) var(--ease);
        }

        .nv-drawer-link:hover { color: var(--ink); }
        .nv-drawer-link-on { color: var(--ink); }

        .nv-drawer-cta { margin-top: auto; }

        @media (max-width: 900px) {
          .nv-links { display: none; }
          .nv-burger { display: grid; }
          .nv-cta { display: none; }
        }
      `}</style>
    </>
  );
}
