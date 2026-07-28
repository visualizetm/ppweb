/* Not automotive. Underserved by the old site, which never mentioned it. */
export default {
  slug: 'portrait',
  name: 'Portraits',
  shortName: 'Portrait',
  category: 'people',
  icon: 'User03',
  order: 5,

  tagline: 'People, shot with the same eye as the cars.',
  summary:
    'Automotive is the bulk of what I shoot, not the limit of it. Portraits get the same approach — real locations, real light, and every delivered frame edited properly. Bring the car if you want it in there.',
  bestFor: 'Individuals, couples, headshots, and anyone who wants their car in the frame with them.',

  vehicles: { min: 0, max: 2 },
  people: { min: 1, max: 6 },
  allowsDirectBooking: true,

  /* PLACEHOLDER PRICING — not confirmed by Michael. */
  priceIsPlaceholder: true,
  tiers: [
    {
      id: 'portrait-essential',
      name: 'Essential',
      priceCents: 22500, // PLACEHOLDER
      durationMinutes: 60,
      durationLabel: '~1 hour',
      locations: 1,
      blurb: 'One location, one or two people.',
      includes: [
        'One location',
        'One or two people',
        'Every delivered image fully edited',
        'Web and print resolution files',
        'Private online gallery',
      ],
    },
    {
      id: 'portrait-extended',
      name: 'Extended',
      priceCents: 37500, // PLACEHOLDER
      durationMinutes: 120,
      durationLabel: '~2 hours',
      locations: 2,
      recommended: true,
      blurb: 'Two locations, outfit changes, car optional.',
      includes: [
        'Two locations',
        'Outfit or setup changes',
        'Your car in the frame if you want it',
        'Every delivered image fully edited',
        'Web and print resolution files',
        'Private online gallery',
      ],
    },
  ],

  notIncluded: ['Hair and makeup', 'Studio lighting setups'],

  addonIds: ['extra-hour', 'second-location', 'rush'],
};
