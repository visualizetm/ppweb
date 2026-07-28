/* ===========================================================================
   Social brand marks.
   ---------------------------------------------------------------------------
   @untitled-ui/icons-react has no brand glyphs, and adding a second icon
   library for two marks would double the icon surface for no benefit. So these
   are hand-drawn on the same 24x24 grid, with the same 2px stroke, the same
   round caps and joins, and the same currentColor convention — they sit next to
   the Untitled UI set without looking borrowed.
   =========================================================================== */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export function InstagramIcon({ width = 20, height = 20, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ width = 20, height = 20, ...rest }) {
  return (
    <svg {...base} width={width} height={height} {...rest}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M14.8 8.2h-1.4a1.8 1.8 0 0 0-1.8 1.8v11.4" />
      <path d="M9.6 13.1h4.6" />
    </svg>
  );
}

export const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
};

export default SOCIAL_ICONS;
