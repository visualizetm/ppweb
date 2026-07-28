/* One car, one owner. The core of the business. */
export default {
  slug: 'solo',
  name: 'Solo Shoot',
  shortName: 'Solo',
  category: 'automotive',
  icon: 'Car01',
  order: 1,

  tagline: 'One car, shot properly.',
  summary:
    'Your car, one location or two, worked from every angle I can find. This is the shoot most people mean when they say they want photos of their car.',
  bestFor: 'A single vehicle you want photographed like it matters.',

  vehicles: { min: 1, max: 1 },
  people: { min: 0, max: 2 },
  allowsDirectBooking: true,

  /* PLACEHOLDER PRICING — every priceCents below is invented so the booking
     flow could be built. Michael has not confirmed any of these numbers. */
  priceIsPlaceholder: true,
  tiers: [
    {
      id: 'solo-essential',
      name: 'Essential',
      priceCents: 27500, // PLACEHOLDER
      durationMinutes: 90,
      durationLabel: '~90 minutes',
      locations: 1,
      blurb: 'One location, static and detail work.',
      includes: [
        'One location of your choosing',
        'Full exterior, interior and detail coverage',
        'Every delivered image fully edited',
        'Web and print resolution files',
        'Private online gallery',
      ],
    },
    {
      id: 'solo-extended',
      name: 'Extended',
      priceCents: 42500, // PLACEHOLDER
      durationMinutes: 150,
      durationLabel: '~2.5 hours',
      locations: 2,
      recommended: true,
      blurb: 'Two locations, plus rolling shots.',
      includes: [
        'Two locations, scouted in advance',
        'Rolling and panning shots',
        'Full exterior, interior and detail coverage',
        'Every delivered image fully edited',
        'Web and print resolution files',
        'Private online gallery',
      ],
    },
  ],

  notIncluded: [
    'A guaranteed number of images — see the FAQ for why',
    'Track or closed-course access',
  ],

  addonIds: ['extra-hour', 'extra-vehicle', 'rolling-shots', 'second-location', 'rush', 'drone'],
};
