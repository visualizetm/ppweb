import { useEffect, useState, useCallback } from 'react';
import Sun from '@untitled-ui/icons-react/build/esm/Sun';
import Moon01 from '@untitled-ui/icons-react/build/esm/Moon01';

const KEY = 'pp_theme';

const readStored = () => {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
};

/* Light-first: anything that is not explicitly 'dark' resolves to light. */
const currentTheme = () =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

/* ===========================================================================
   Theme toggle.
   ---------------------------------------------------------------------------
   Follows the OS preference until the visitor makes a choice. After that their
   choice wins permanently — a site that keeps overriding you at sunset is
   worse than one that never followed the OS at all.
   =========================================================================== */

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(currentTheme);

  /* Follow the OS only while no explicit choice is stored. */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      if (readStored()) return;
      const next = e.matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode — the choice just will not survive a reload */
    }
  }, []);

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <>
      <button type="button" className={`tt ${className}`.trim()} onClick={toggle} aria-label={label} title={label}>
        <span className="tt-icon" aria-hidden="true">
          {theme === 'dark' ? <Sun width={17} height={17} /> : <Moon01 width={17} height={17} />}
        </span>
      </button>

      <style>{`
        .tt {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          flex: none;
          border-radius: var(--radius);
          border: 1px solid var(--edge-strong);
          background: var(--panel);
          color: var(--ink-soft);
          transition: background-color var(--duration-fast) var(--ease),
            color var(--duration-fast) var(--ease),
            border-color var(--duration-fast) var(--ease),
            transform var(--duration-fast) var(--ease);
        }

        .tt:hover {
          background: var(--panel-high);
          color: var(--ink);
          transform: translateY(-1px);
        }

        .tt-icon {
          display: grid;
          place-items: center;
        }
      `}</style>
    </>
  );
}
