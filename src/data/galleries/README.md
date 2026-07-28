# Galleries

One file per shoot. The Portfolio index, the individual gallery pages and the
homepage feature strip all read from this folder. **Adding a shoot does not
require a code change.**

## Adding a shoot

1. Duplicate `solo-shoot-101125.js` and rename it to your new slug, e.g.
   `duo-shoot-11525.js`.
2. Change `slug` inside the file to match the filename (lowercase, hyphens, no
   spaces). This becomes the URL: `/portfolio/duo-shoot-11525`.
3. Make a folder for the photos: `public/galleries/duo-shoot-11525/`.
4. Run the optimiser so the photos are web-sized before they ship:
   ```
   node scripts/optimize-images.mjs <folder-of-originals> public/galleries/duo-shoot-11525
   ```
5. List the photos in the `images` array (see below).
6. Open `index.js`, add one `import` line and put the name in the `galleries`
   array. **Position in that array is the order on the site — newest first.**

That is all of it.

## The `images` array

Each entry is one photo:

```js
images: [
  { src: '/galleries/duo-shoot-11525/01', alt: 'Front three-quarter, wet asphalt' },
  { src: '/galleries/duo-shoot-11525/02', alt: 'Interior detail, dash lit by streetlight' },
],
```

Note the `src` has **no file extension**. The optimiser produces `01.jpg`,
`01.webp` and `01-thumb.jpg` from one original, and the gallery component picks
the right one per browser and per context automatically. Give it the name
without the extension and it handles the rest.

Write real `alt` text. It is what a screen reader announces and it is what
Google reads. "Front three-quarter, wet asphalt" is useful; "IMG_4821" is not.

## Cover images

`cover` works the same way — a path with no extension:

```js
cover: '/galleries/duo-shoot-11525/cover',
```

Set `cover: null` and the card renders a dashed placeholder slot with a label
instead. **That is deliberate** — a gallery can go live before its cover exists,
and the placeholder makes the gap obvious rather than shipping a broken image.

## Fields

| Field | What it does |
|---|---|
| `slug` | URL and folder name. Must match the filename. |
| `title` | Shown on the card and as the page heading. |
| `caption` | The short descriptive line under the title. **Write a real description, not just a date** — "Two cars, sunset, paired compositions" tells a visitor something; "10/8/25" does not. |
| `date` | ISO format `YYYY-MM-DD`, used for sorting. `null` if unknown. |
| `dateLabel` | How the date is displayed, e.g. `10/8/25`. |
| `type` | `Solo`, `Duo`, `Group` or `Event`. Drives the filter row on the Portfolio page — a new value automatically becomes a new filter. |
| `packageSlug` | Links the gallery to a package, so a gallery page can offer "book this kind of shoot". |
| `location` | Optional. Shown as meta on the gallery page. |
| `featured` | `true` puts it in the homepage strip. |
| `featureOrder` | Order within that strip. |
| `blurb` | A sentence or two on the gallery page itself. |
| `images[]` | The photos. Empty array renders placeholder slots. |
| `sourceUrl` | Where the gallery currently lives on Adobe Portfolio. Reference only — the site never links to it. |

## Two things flagged for Michael

**1. The Rain Solo date conflict.** The old homepage captioned that shoot
`10/18/25`, but the link it sat inside pointed at `rain-solo-shoot-91825` and the
gallery is titled `9/18/25`. I used **9/18/25** because the slug and the title
agree and only the caption dissents — but it is flagged with `dateDisputed: true`
in the file and needs confirming. If it turns out to be October, the slug and the
`public/galleries/` folder both need renaming to match.

**2. Three `coverAlt` values are unverified.** The alt text on the old site read
"BMW M3 rolling shot", "Porsche 911 sunset" and "Audi R8 city night". Those are
preserved because they were there, but they look like filler written by whoever
built the old site rather than a record of what was actually shot — and the
"Audi R8 city night" one is attached to a gallery called *Rain Solo Shoot*, which
does not obviously match. They are marked `coverAltUnverified: true`. Confirm what
the cars actually are, then correct the alt text and delete that flag.

## Migrating the rest of the images

Six of the nine galleries have no images yet, and the three that do only have a
cover. The originals still live on Adobe Portfolio. `scripts/fetch-galleries.sh`
downloads them — run it from a normal network connection, then run the optimiser
over the output. See that script's header for the steps.

**Ask Michael for the full-resolution originals regardless.** What is on Adobe
Portfolio has already been resized and re-compressed once by their CDN, and this
is a site whose entire argument is image quality. Re-compressing someone else's
compression is the one thing you cannot undo later.
