/* Three or more cars. Logistics start to matter, so this one starts with a talk. */
export default {
  slug: 'group',
  name: 'Group Shoot',
  shortName: 'Group',
  category: 'automotive',
  icon: 'Users01',
  order: 3,

  tagline: 'Three cars or thirty. Bring the crew.',
  summary:
    'A group shoot is a different animal — parking, sequencing, light that moves while you are still positioning cars. It works, but it works because it gets planned. That is why this one starts with a conversation.',
  bestFor: 'Car clubs, friend groups, and anyone organising a private meet.',

  vehicles: { min: 3, max: 30 },
  people: { min: 0, max: 60 },
  /* Consultation-first by design: pricing genuinely depends on car count and
     location, and quoting it blind would be dishonest. */
  allowsDirectBooking: false,
  consultationReason:
    'Group pricing depends on how many cars, where, and how long — so it gets quoted after we talk, not before.',

  /* PLACEHOLDER PRICING — not confirmed by Michael. */
  priceIsPlaceholder: true,
  tiers: [
    {
      id: 'group-standard',
      name: 'Group Coverage',
      priceCents: 75000, // PLACEHOLDER — from
      priceFrom: true,
      durationMinutes: 180,
      durationLabel: '3 hours+',
      locations: 1,
      blurb: 'Quoted after the consultation, based on car count and location.',
      includes: [
        'Pre-shoot planning call',
        'Location scouting and parking plan',
        'Individual coverage of every car',
        'Full group compositions',
        'Every delivered image fully edited',
        'One shared gallery, plus per-owner sets',
      ],
    },
  ],

  notIncluded: ['Venue or lot permission — that is on the organiser', 'Permits'],

  addonIds: ['extra-hour', 'rolling-shots', 'second-location', 'rush', 'drone'],
};
