/* Consultation-only, always. Nobody books a wedding off a pricing table. */
export default {
  slug: 'wedding',
  name: 'Weddings',
  shortName: 'Wedding',
  category: 'people',
  icon: 'Heart',
  order: 6,

  tagline: 'A day that only happens once.',
  summary:
    'I have shot weddings, and I take them seriously. Every wedding is scoped individually — hours, locations, second shooter, what matters most to you. There is no package that fits every wedding, so I do not pretend there is.',
  bestFor: 'Couples who want a photographer who will actually plan the day with them.',

  vehicles: { min: 0, max: null },
  people: { min: 2, max: null },
  allowsDirectBooking: false,
  consultationReason:
    'Weddings are always scoped in person. Nothing about a wedding fits a pricing table.',

  /* No published price — deliberately. This is not a placeholder omission. */
  priceIsPlaceholder: false,
  quoteOnly: true,
  tiers: [
    {
      id: 'wedding-custom',
      name: 'Custom Coverage',
      priceCents: null,
      quoteOnly: true,
      durationMinutes: null,
      durationLabel: 'Scoped with you',
      locations: null,
      blurb: 'Built around your day, quoted after we talk.',
      includes: [
        'Planning meeting before anything is booked',
        'Coverage scoped to your schedule',
        'Every delivered image fully edited',
        'Private online gallery',
        'Print-ready files',
      ],
    },
  ],

  notIncluded: [],

  addonIds: ['second-location', 'rush'],
};
