/* Gallery registry. Array order is display order — newest first. */
import trunkOrTreat from './trunk-or-treat-102525';
import solo1024 from './102425-solo';
import solo1011 from './solo-shoot-101125';
import duo1008 from './duo-shoot-10825';
import rainSolo from './rain-solo-shoot-91825';
import duo0830 from './duo-shoot-83025';
import ghettoGarage from './ghetto-garage-groupshoot-1';
import collegeville from './collegeville-cars-coffee';
import mainline from './mainline-cars-coffee-82425';

export const galleries = [
  trunkOrTreat,
  solo1024,
  solo1011,
  duo1008,
  rainSolo,
  duo0830,
  ghettoGarage,
  collegeville,
  mainline,
];

export const getGallery = (slug) => galleries.find((g) => g.slug === slug);

/** Distinct types, for the portfolio filter row. */
export const galleryTypes = ['All', ...new Set(galleries.map((g) => g.type))];

export const galleriesByType = (type) =>
  !type || type === 'All' ? galleries : galleries.filter((g) => g.type === type);

/** The three the homepage features, in explicit order. */
export const featuredGalleries = galleries
  .filter((g) => g.featured)
  .sort((a, b) => (a.featureOrder || 99) - (b.featureOrder || 99));

/** Galleries still waiting on their images. Surfaced in the admin so Michael
    can see at a glance what is left to migrate. */
export const galleriesMissingImages = galleries.filter((g) => !g.images?.length);

export default galleries;
