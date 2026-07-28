export default {
  slug: 'rain-solo-shoot-91825',
  title: 'Rain Solo Shoot',
  caption: 'Wet asphalt, reflections, shot in the rain on purpose',
  /* ---------------------------------------------------------------------
     UNRESOLVED DATE CONFLICT — do not silently pick one.

     The previous site's homepage captioned this shoot "10/18/25", but the
     link immediately around that caption pointed at the gallery slug
     "rain-solo-shoot-91825", and the gallery itself is titled 9/18/25.
     Two different dates inside the same element.

     I have used 9/18/25 here because the slug and the gallery title agree
     with each other and only the caption dissents — but this is a guess,
     and `dateDisputed` keeps it visible until Michael confirms. Once he
     does: set the correct `date` / `dateLabel`, delete `dateDisputed` and
     `dateDisputedNote`, and if the date changes, rename the slug and the
     matching folder in public/galleries/.
     --------------------------------------------------------------------- */
  date: '2025-09-18',
  dateLabel: '9/18/25',
  dateDisputed: true,
  dateDisputedNote:
    'Old site captioned this 10/18/25; the gallery slug and title both say 9/18/25.',

  type: 'Solo',
  subtype: 'Specialty',
  packageSlug: 'solo',
  location: '', // PLACEHOLDER — Michael to confirm
  featured: true,
  featureOrder: 3,

  blurb:
    'Rain is usually the reason a shoot gets moved. This one it was the reason to go out — wet asphalt turns every light source into a second light source.',

  /* Cover recovered from the previous site (was Storage/Photos/IMG9.JPG). */
  cover: '/galleries/rain-solo-shoot-91825/cover',
  coverAlt: 'Audi R8 city night',
  coverAltUnverified: true,

  images: [],
  sourceUrl: 'https://mpappasproductions.myportfolio.com/rain-solo-shoot-91825',
};
