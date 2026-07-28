/* Package registry. Array order is display order. */
import solo from './solo';
import duo from './duo';
import group from './group';
import event from './event';
import portrait from './portrait';
import wedding from './wedding';
import editing from './editing';

export const packages = [solo, duo, group, event, portrait, wedding, editing];

export const getPackage = (slug) => packages.find((p) => p.slug === slug);

export const getTier = (packageSlug, tierId) =>
  getPackage(packageSlug)?.tiers.find((t) => t.id === tierId);

/** Packages a client can book and pay a deposit for without talking first. */
export const directBookable = packages.filter((p) => p.allowsDirectBooking);

/** Grouped for the Services page, which reads better split by kind of work. */
export const packageGroups = [
  {
    id: 'automotive',
    title: 'Automotive',
    blurb: 'The bulk of the work, and the reason most people get in touch.',
    items: packages.filter((p) => p.category === 'automotive'),
  },
  {
    id: 'people',
    title: 'People',
    blurb: 'Automotive is the bulk of it, not the limit of it.',
    items: packages.filter((p) => p.category === 'people'),
  },
  {
    id: 'service',
    title: 'Editing',
    blurb: 'Work on photos that already exist — including ones I did not take.',
    items: packages.filter((p) => p.category === 'service'),
  },
];

/** True while ANY package still carries invented pricing. Drives the demo
    "placeholder pricing" notice, which disappears on its own once Michael's
    real numbers are in and every priceIsPlaceholder flag is set to false. */
export const hasPlaceholderPricing = packages.some((p) => p.priceIsPlaceholder);

export default packages;
