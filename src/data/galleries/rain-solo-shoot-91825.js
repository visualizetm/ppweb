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
    'Rain is usually the reason a shoot gets moved. Here it was the reason to go out. Water beads on a clean panel and every drop picks up whatever light is going, so a flat grey car in a downpour ends up with more texture than the same car on a dry day.',

  /* Cover recovered from the previous site (was Storage/Photos/IMG9.JPG). */
  cover: '/galleries/rain-solo-shoot-91825/cover',
  /* VERIFIED by direct inspection of the image on 2026-07-29.
     The old site labelled this "Audi R8 city night". It is not an R8, it is
     not in a city, and it is not night — it is a grey hatchback in daylight
     rain. All three of the old site's cover captions were wrong.

     NOTE FOR MICHAEL: the rear window carries vinyl decals including a
     personal Instagram handle belonging to the car's owner. It is legible in
     the full-size image. Deliberately not transcribed into alt text — no
     reason to republish someone's handle in a machine-readable field without
     asking them. Worth a quick check that the owner is happy for this frame
     to be the gallery cover at all. */
  coverAlt:
    'Rain beading across the rear quarter window and flank of a dark grey hatchback',

  /* Sampled from the cover: no chromatic region at all. Correct — the frame is
     genuinely greyscale. This is the clearest case for keeping paint null. */
  paint: null,

  images: [],
  sourceUrl: 'https://mpappasproductions.myportfolio.com/rain-solo-shoot-91825',
};
