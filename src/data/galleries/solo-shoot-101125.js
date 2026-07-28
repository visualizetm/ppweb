export default {
  slug: 'solo-shoot-101125',
  title: 'Solo Shoot',
  /* The descriptive caption is deliberately not just the date — a date tells a
     visitor nothing about whether they want to click it. */
  caption: 'One car, golden hour, rolling work',
  date: '2025-10-11',
  dateLabel: '10/11/25',
  type: 'Solo',
  packageSlug: 'solo',
  location: '', // PLACEHOLDER — Michael to confirm
  featured: true,
  featureOrder: 1,

  blurb:
    'A single car worked from every angle the light allowed, finishing with rolling shots as the sun dropped.',

  /* Cover recovered from the previous site (was Storage/Photos/IMG7.JPG). */
  cover: '/galleries/solo-shoot-101125/cover',
  /* The alt text below is preserved verbatim from the old site, but it is NOT
     verified — see the note in this folder's README. Do not treat "BMW M3" as a
     confirmed fact about this shoot until Michael says so. */
  coverAlt: 'BMW M3 rolling shot',
  coverAltUnverified: true,

  /* Empty until the full set is migrated off Adobe Portfolio. The gallery page
     renders labelled placeholder slots while this is empty, so the page ships
     either way. See scripts/fetch-galleries.sh. */
  images: [],
  sourceUrl: 'https://mpappasproductions.myportfolio.com/solo-shoot-101125',
};
