/* Cars & Coffee, meets, club events. Documentary, not posed. */
export default {
  slug: 'event',
  name: 'Event Coverage',
  shortName: 'Event',
  category: 'automotive',
  icon: 'CalendarHeart01',
  order: 4,

  tagline: 'Meets, shows and Cars & Coffee, covered end to end.',
  summary:
    'Coverage of the whole event rather than one car — arrivals, the cars that turn up, the people, the details. This is documentary work: I move constantly and shoot what actually happens.',
  bestFor: 'Meet and club organisers, venues, and show promoters.',

  vehicles: { min: 0, max: null },
  people: { min: 0, max: null },
  allowsDirectBooking: false,
  consultationReason:
    'Event coverage is priced on hours, scale and what you need it for — so it gets scoped in a call first.',

  /* PLACEHOLDER PRICING — not confirmed by Michael. */
  priceIsPlaceholder: true,
  tiers: [
    {
      id: 'event-standard',
      name: 'Event Coverage',
      priceCents: 60000, // PLACEHOLDER — from
      priceFrom: true,
      durationMinutes: 180,
      durationLabel: '3 hours+',
      locations: 1,
      blurb: 'Quoted after the consultation, based on hours and scale.',
      includes: [
        'Pre-event planning call',
        'Full-event documentary coverage',
        'Arrivals, cars, crowd and detail work',
        'Every delivered image fully edited',
        'Gallery ready for social use',
        'Organiser usage rights for promotion',
      ],
    },
  ],

  notIncluded: ['Individual owner sets for every attending car', 'Live same-day posting'],

  addonIds: ['extra-hour', 'rush', 'drone', 'social-cutdown'],
};
