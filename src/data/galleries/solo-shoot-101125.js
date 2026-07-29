export default {
  slug: 'solo-shoot-101125',
  title: 'Solo Shoot',
  /* The descriptive caption is deliberately not just the date — a date tells a
     visitor nothing about whether they want to click it. */
  caption: 'Silver Camaro SS against a stone mill, flat autumn light',
  date: '2025-10-11',
  dateLabel: '10/11/25',
  type: 'Solo',
  packageSlug: 'solo',
  location: '', // PLACEHOLDER — Michael to confirm
  featured: true,
  featureOrder: 1,

  blurb:
    'A silver Camaro parked against stone and a red waterwheel, shot under flat overcast. Not every good frame needs golden hour — grey light is soft, even, and it lets a hard-edged car keep its shape instead of blowing out down one flank.',

  /* Cover recovered from the previous site (was Storage/Photos/IMG7.JPG). */
  cover: '/galleries/solo-shoot-101125/cover',
  /* VERIFIED by direct inspection of the image on 2026-07-29.
     The old site labelled this "BMW M3 rolling shot". It is not a BMW, it is
     not an M3, and it is not a rolling shot — the car is stationary. The old
     alt text was filler written by whoever built that site. */
  coverAlt:
    'Silver Chevrolet Camaro SS parked in front of a stone mill building with a red waterwheel',

  /* Sampled from the cover with scripts/sample-paint.mjs. Comes back
     near-achromatic because the subject genuinely is: silver car, grey stone,
     white sky. null keeps the page achromatic rather than forcing a muddy
     brown accent onto it. See this folder's README. */
  paint: null,

  /* Empty until the full set is migrated off Adobe Portfolio. The gallery page
     renders labelled placeholder slots while this is empty, so the page ships
     either way. See scripts/fetch-galleries.sh. */
  images: [],
  sourceUrl: 'https://mpappasproductions.myportfolio.com/solo-shoot-101125',
};
