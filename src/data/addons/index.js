/* ===========================================================================
   Add-ons — optional extras attached at step 3 of the booking wizard.
   ---------------------------------------------------------------------------
   Which add-ons a package offers is set by `addonIds[]` on the package itself,
   so an add-on can exist here without appearing everywhere.

   PLACEHOLDER PRICING: every priceCents in this file is invented. Set
   `priceIsPlaceholder: false` on an add-on once Michael confirms its real price
   and the visible placeholder marker disappears for that item.
   =========================================================================== */

export const addons = [
  {
    id: 'extra-hour',
    name: 'Extra hour',
    icon: 'Clock',
    priceCents: 9500, // PLACEHOLDER
    priceIsPlaceholder: true,
    unit: 'per hour',
    /* Quantity add-ons let the client pick how many. */
    quantity: { min: 1, max: 4, default: 1 },
    description:
      'More time on location. Honestly, if we are close to the shot when time is up, I will usually keep going anyway — this is for when you know up front you want longer.',
  },
  {
    id: 'extra-vehicle',
    name: 'Additional vehicle',
    icon: 'Car01',
    priceCents: 12500, // PLACEHOLDER
    priceIsPlaceholder: true,
    unit: 'per car',
    quantity: { min: 1, max: 4, default: 1 },
    description:
      'Add another car to the session. Each one gets its own individual coverage, not just a spot in the group frames.',
  },
  {
    id: 'rolling-shots',
    name: 'Rolling & chase shots',
    icon: 'Zap',
    priceCents: 15000, // PLACEHOLDER
    priceIsPlaceholder: true,
    unit: 'flat',
    description:
      'Panning and chase work from a moving vehicle — the shots where the car is actually driving and the background is a blur. Needs a driver you trust and a road that suits it, which we sort out beforehand.',
  },
  {
    id: 'second-location',
    name: 'Second location',
    icon: 'MarkerPin01',
    priceCents: 10000, // PLACEHOLDER
    priceIsPlaceholder: true,
    unit: 'flat',
    description:
      'Move the shoot somewhere else partway through. Two backdrops instead of one, and the set stops looking like it all happened in a car park.',
  },
  {
    id: 'rush',
    name: 'Rush turnaround',
    icon: 'Rocket01',
    priceCents: 12500, // PLACEHOLDER
    priceIsPlaceholder: true,
    unit: 'flat',
    description:
      'Edited gallery back inside four days instead of the usual two weeks. The editing is identical — it just jumps the queue.',
  },
  {
    id: 'drone',
    name: 'Drone / aerial',
    icon: 'Send01',
    priceCents: 17500, // PLACEHOLDER
    priceIsPlaceholder: true,
    unit: 'flat',
    /* PLACEHOLDER: confirm whether Michael flies, and whether he holds a Part
       107 certificate. Airspace restrictions apply across much of the
       Philadelphia area. Set `available: false` if this is not offered. */
    available: true,
    requiresConfirmation: true,
    description:
      'Overhead and elevated angles. Subject to airspace rules at the location — some spots around Philadelphia are restricted, so this gets confirmed before the shoot rather than promised blind.',
  },
  {
    id: 'social-cutdown',
    name: 'Social cut-down set',
    icon: 'Phone01',
    priceCents: 8500, // PLACEHOLDER
    priceIsPlaceholder: true,
    unit: 'flat',
    description:
      'A vertical, crop-correct set of your best frames, sized for stories and reels so you are not cropping a landscape photo badly on your phone.',
  },
];

export const getAddon = (id) => addons.find((a) => a.id === id);

/** The add-ons a given package offers, in registry order, minus anything
    switched off with `available: false`. */
export const addonsForPackage = (pkg) =>
  (pkg?.addonIds || [])
    .map(getAddon)
    .filter((a) => a && a.available !== false);

export const hasPlaceholderAddonPricing = addons.some((a) => a.priceIsPlaceholder);

export default addons;
