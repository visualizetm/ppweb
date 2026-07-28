/* Editing photos he did not take. A real revenue line the old site buried in
   the FAQ and never sold. No shoot, no travel, no date needed. */
export default {
  slug: 'editing',
  name: 'Editing & Retouching',
  shortName: 'Editing',
  category: 'service',
  icon: 'Image03',
  order: 7,

  tagline: 'Your photos. My edit.',
  summary:
    'Every image I publish is edited — that work is a large part of why the photos look the way they do. If you have your own shots, send them over and they get the same treatment. You do not need to have booked a shoot with me.',
  bestFor: 'Anyone sitting on photos of their car that are almost there.',

  vehicles: { min: 0, max: null },
  people: { min: 0, max: null },
  allowsDirectBooking: true,
  /* No shoot means no date step and no travel fee — the wizard reads this. */
  skipsScheduling: true,
  skipsTravel: true,

  /* PLACEHOLDER PRICING — not confirmed by Michael. */
  priceIsPlaceholder: true,
  tiers: [
    {
      id: 'editing-single',
      name: 'Single Image',
      priceCents: 3500, // PLACEHOLDER
      durationMinutes: null,
      durationLabel: 'Per image',
      blurb: 'One photo, fully edited.',
      includes: [
        'Full colour grade',
        'Exposure and contrast work',
        'Distraction and blemish removal',
        'Web and print resolution export',
        'One round of revisions',
      ],
    },
    {
      id: 'editing-set',
      name: 'Set of 10',
      priceCents: 27500, // PLACEHOLDER
      durationMinutes: null,
      durationLabel: 'Per set',
      recommended: true,
      blurb: 'Ten photos, edited as a consistent set.',
      includes: [
        'Ten images, graded to match each other',
        'Full colour grade on every frame',
        'Distraction and blemish removal',
        'Web and print resolution export',
        'One round of revisions',
      ],
    },
  ],

  notIncluded: ['Compositing or object replacement', 'Video grading'],

  addonIds: ['rush'],
};
