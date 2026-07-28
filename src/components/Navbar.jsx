import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Menu01 from '@untitled-ui/icons-react/build/esm/Menu01';
import XClose from '@untitled-ui/icons-react/build/esm/XClose';
import Image03 from '@untitled-ui/icons-react/build/esm/Image03';
import Tag01 from '@untitled-ui/icons-react/build/esm/Tag01';
import User01 from '@untitled-ui/icons-react/build/esm/User01';
import HelpCircle from '@untitled-ui/icons-react/build/esm/HelpCircle';
import Mail01 from '@untitled-ui/icons-react/build/esm/Mail01';
import ArrowRight from '@untitled-ui/icons-react/build/esm/ArrowRight';

import Wordmark from './Wordmark';
import ThemeToggle from './ThemeToggle';
import { navLinks } from '../data/site';

const ICONS = { Image03, Tag01, User01, HelpCircle, Mail01 };

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close the drawer on navigation, or it stays open over the new page. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* Lock the body while the drawer is open, and let Escape close it. */
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header className={`nv ${scrolled ? 'nv-scrolled' : ''}`}>
        <nav className="nv-pill" aria-label="Main">
          <Wordmark size="sm" />

          <ul className="nv-links">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => `nv-link ${isActive ? 'nv-link-active' : ''}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nv-actions">
            <ThemeToggle />
            <Link to="/book" className="btn btn-primary btn-sm nv-cta">
              Book a shoot
              <ArrowRight className="arrow" width={15} height={15} aria-hidden="true" />
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

      {/* Mobile drawer */}
      <div
        className={`nv-overlay ${open ? 'nv-overlay-open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="nv-drawer"
        className={`nv-drawer ${open ? 'nv-drawer-open' : ''}`}
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
          {navLinks.map((link) => {
            const Icon = ICONS[link.icon] || Image03;
            return (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `nv-drawer-link ${isActive ? 'nv-drawer-link-active' : ''}`
                  }
                >
                  <Icon width={18} height={18} aria-hidden="true" />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <Link to="/book" className="btn btn-primary nv-drawer-cta">
          Book a shoot
          <ArrowRight className="arrow" width={16} height={16} aria-hidden="true" />
        </Link>
      </aside>

      <style>{`
        .nv {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: var(--space-4) var(--space-6) 0;
          transition: padding var(--duration) var(--ease);
        }

        .nv-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-6);
          max-width: var(--max-width);
          margin-inline: auto;
          padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
          border-radius: var(--radius-pill);
          border: 1px solid var(--glass-border);
          background: var(--chrome);
          backdrop-filter: blur(var(--glass-blur-strong)) saturate(160%);
          -webkit-backdrop-filter: blur(var(--glass-blur-strong)) saturate(160%);
          box-shadow: var(--shadow-chrome);
          transition: background-color var(--duration) var(--ease),
            box-shadow var(--duration) var(--ease), border-color var(--duration) var(--ease);
        }

        .nv-scrolled .nv-pill {
          background: var(--chrome-solid);
          box-shadow: var(--shadow-chrome-strong);
          border-color: var(--border-light);
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
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-pill);
          color: var(--text-muted);
          font-size: 0.875rem;
          font-weight: 500;
          transition: color var(--duration-fast) var(--ease),
            background-color var(--duration-fast) var(--ease);
        }

        .nv-link:hover { color: var(--text); background: var(--hover-soft); }

        .nv-link-active {
          color: var(--text);
          background: var(--hover-strong);
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
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid var(--border-light);
          background: var(--glass-bg);
          color: var(--text);
        }

        .nv-close { display: grid; }

        .nv-burger:hover, .nv-close:hover { background: var(--hover-strong); }

        /* --- drawer --- */
        .nv-overlay {
          position: fixed;
          inset: 0;
          z-index: 110;
          background: rgba(0, 0, 0, 0.6);
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--duration) var(--ease);
        }

        .nv-overlay-open { opacity: 1; pointer-events: auto; }

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
          background: var(--bg-elevated);
          border-left: 1px solid var(--border);
          transform: translateX(100%);
          transition: transform var(--duration) var(--ease);
          overflow-y: auto;
        }

        .nv-drawer-open { transform: translateX(0); }

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
          gap: var(--space-1);
        }

        .nv-drawer-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius);
          color: var(--text-secondary);
          font-weight: 500;
          transition: background-color var(--duration-fast) var(--ease),
            color var(--duration-fast) var(--ease);
        }

        .nv-drawer-link:hover { background: var(--hover-soft); color: var(--text); }

        .nv-drawer-link-active {
          background: var(--glass-bg-brand);
          color: var(--brand-ink);
        }

        .nv-drawer-cta { margin-top: auto; }

        @media (max-width: 900px) {
          .nv { padding-inline: var(--space-4); }
          .nv-links { display: none; }
          .nv-burger { display: grid; }
          .nv-cta { display: none; }
        }
      `}</style>
    </>
  );
}
