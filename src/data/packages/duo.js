/* Two cars together — the pairing shots are the whole point. */
export default {
  slug: 'duo',
  name: 'Duo Shoot',
  shortName: 'Duo',
  category: 'automotive',
  icon: 'Cube02',
  order: 2,

  tagline: 'Two cars, and the shots only two cars can give you.',
  summary:
    'Bring a friend. Two cars opens up pairing, staggered and convoy compositions that a single car cannot do, and you both walk away with a full set.',
  bestFor: 'Two owners shooting together, or one owner with two cars.',

  vehicles: { min: 2, max: 2 },
  people: { min: 0, max: 4 },
  allowsDirectBooking: true,

  /* PLACEHOLDER PRICING — not confirmed by Michael. */
  priceIsPlaceholder: true,
  tiers: [
    {
      id: 'duo-essential',
      name: 'Essential',
      priceCents: 45000, // PLACEHOLDER
      durationMinutes: 120,
      durationLabel: '~2 hours',
      locations: 1,
      blurb: 'One location, both cars covered individually and together.',
      includes: [
        'One location',
        'Individual coverage of each car',
        'Paired and staggered compositions',
        'Every delivered image fully edited',
        'Separate private galleries for each owner',
      ],
    },
    {
      id: 'duo-extended',
      name: 'Extended',
      priceCents: 65000, // PLACEHOLDER
      durationMinutes: 180,
      durationLabel: '~3 hours',
      locations: 2,
      recommended: true,
      blurb: 'Two locations, plus rolling and convoy work.',
      includes: [
        'Two locations, scouted in advance',
        'Rolling, panning and convoy shots',
        'Individual coverage of each car',
        'Paired and staggered compositions',
        'Every delivered image fully edited',
        'Separate private galleries for each owner',
      ],
    },
  ],

  notIncluded: ['A guaranteed number of images', 'Road closures or permits'],

  addonIds: ['extra-hour', 'extra-vehicle', 'rolling-shots', 'second-location', 'rush', 'drone'],
};
