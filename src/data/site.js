/* ===========================================================================
   Site-wide configuration.
   ---------------------------------------------------------------------------
   Michael: this is the file to edit for anything that appears in more than one
   place — contact details, social links, service area, policies, pricing rules.
   Everything marked PLACEHOLDER is a stand-in I invented so the site could be
   built. Replace those values and the change appears everywhere at once.

   Nothing in here requires a code change to update.
   =========================================================================== */

export const site = {
  name: 'Paps Productions',
  photographer: 'Michael Pappas',
  tagline: 'Cinematic Automotive Photography',
  shortDescription:
    'Cinematic automotive photography in Philadelphia and on the Main Line.',
  metaDescription:
    'Cinematic automotive photography by Paps Productions. Solo, duo, group and event coverage across Philadelphia and the Main Line. Book a free consultation with Michael Pappas.',

  /* --- Contact -------------------------------------------------------------
     PLACEHOLDER: none of this is published anywhere on the current site.
     Michael needs to supply a real email and phone. Until he does, every
     contact surface renders a "coming soon" state instead of a fake address —
     set `published: false` to keep it that way, `true` once real. */
  contact: {
    published: false,
    email: 'hello@papsprod.com', // PLACEHOLDER — not confirmed
    phone: '(610) 555-0123', // PLACEHOLDER — not confirmed
    phoneHref: 'tel:+16105550123', // PLACEHOLDER — not confirmed
    responseTime: 'within 24 hours', // PLACEHOLDER — not confirmed
  },

  /* --- Social ---------------------------------------------------------------
     These two ARE real — recovered from the previous site's footer. */
  social: [
    {
      id: 'instagram',
      label: 'Instagram',
      handle: '@paps_productions',
      url: 'https://www.instagram.com/paps_productions/',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      handle: 'Paps Productions',
      url: 'https://www.facebook.com/papsproductions/',
    },
  ],

  /* --- Where he works -------------------------------------------------------
     PLACEHOLDER: radius and base are assumptions drawn from the gallery names
     (Main Line Cars & Coffee, Collegeville). Confirm with Michael. */
  serviceArea: {
    base: 'Philadelphia & the Main Line, PA',
    baseShort: 'Main Line, PA',
    freeRadiusMiles: 30, // PLACEHOLDER — not confirmed
    maxRadiusMiles: 90, // PLACEHOLDER — not confirmed
    blurb:
      'Shoots happen on location — streets, garages, back roads and meets. There is no studio, which is the point: the car belongs somewhere.',
  },

  /* --- Business hours ------------------------------------------------------
     PLACEHOLDER: entirely invented. Confirm with Michael. */
  hours: {
    published: false,
    note: 'Most shoots run early morning or the hour before sunset. Weekends fill first.',
    lines: [
      { days: 'Mon – Thu', time: 'By appointment' }, // PLACEHOLDER
      { days: 'Fri – Sun', time: 'Golden hour & evening' }, // PLACEHOLDER
    ],
  },
};

/* ===========================================================================
   Pricing rules
   ---------------------------------------------------------------------------
   Per-package prices live in src/data/packages/. These are the rules that apply
   across all of them.
   =========================================================================== */
export const pricing = {
  /* Every price in this project is stored in CENTS as a whole number. Never
     store money as a float — 0.1 + 0.2 is not 0.3 and a customer will notice. */
  currency: 'USD',

  /* PLACEHOLDER: flat deposit, same for every package, per the agreed model.
     One number to change when Michael confirms. */
  depositCents: 10000, // $100.00 — PLACEHOLDER
  depositIsPlaceholder: true,

  /* PLACEHOLDER: travel. Included inside the free radius, one flat surcharge
     beyond it up to maxRadiusMiles. */
  travel: {
    freeRadiusMiles: 30, // PLACEHOLDER
    feeCents: 5000, // $50.00 — PLACEHOLDER
    isPlaceholder: true,
    label: 'Extended travel',
    description:
      'Travel is included within 30 miles of the Main Line. Beyond that, one flat fee covers the drive — no per-mile arithmetic.',
  },

  /* PLACEHOLDER: turnaround. */
  turnaround: {
    isPlaceholder: true,
    standardDays: 14, // PLACEHOLDER
    rushDays: 4, // PLACEHOLDER
    label: 'Standard turnaround: 2 weeks',
    description:
      'Every image that gets delivered is fully edited. That takes as long as it takes to do properly.',
  },
};

/* ===========================================================================
   Cancellation & reschedule policy
   ---------------------------------------------------------------------------
   This text is rendered verbatim on the review step, immediately above the card
   fields, before any payment is taken. Keep it plain. Keep it honest.
   =========================================================================== */
export const policy = {
  isPlaceholder: true, // PLACEHOLDER wording — Michael to confirm or rewrite
  headline: 'Before you pay the deposit',
  points: [
    {
      title: 'The deposit holds your date',
      body: 'It comes off the final balance. It is not an extra charge on top of the session price.',
    },
    {
      title: 'The deposit is non-refundable',
      body: 'If you cancel outright, the deposit stays with the booking. That is what makes holding a date mean something.',
    },
    {
      title: 'Rescheduling is free',
      body: 'Life happens. Move the date with reasonable notice and the deposit moves with it, at no cost.',
    },
    {
      title: 'Weather reschedules are always free, and always my call',
      body: 'If the light or the roads will not give us the shot, we move it. You are never charged for weather, and you never have to be the one to make that decision.',
    },
  ],
  short:
    'Deposit is non-refundable and comes off your balance. Rescheduling is free. Weather reschedules are always free and always my call.',
};

/* ===========================================================================
   Navigation
   =========================================================================== */
export const navLinks = [
  { to: '/portfolio', label: 'Portfolio', icon: 'Image03' },
  { to: '/services', label: 'Services', icon: 'Tag01' },
  { to: '/about', label: 'About', icon: 'User01' },
  { to: '/faq', label: 'FAQ', icon: 'HelpCircle' },
  { to: '/contact', label: 'Contact', icon: 'Mail01' },
];

export default site;
