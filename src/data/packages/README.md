# Packages

Every shoot type on the site — Solo, Duo, Group, Event, Portraits, Weddings and
Editing — is one file in this folder. The Services page, the pricing table and the
booking wizard all read from here. **Changing a price does not require a code
change.** Edit the number, save, redeploy.

## Prices are in cents

`priceCents: 27500` means **$275.00**. Always a whole number, never a decimal.
Money stored as a decimal drifts — `0.1 + 0.2` genuinely does not equal `0.3` in
JavaScript, and it will show up as a wrong total on someone's receipt eventually.

To set a price of $340, write `34000`.

## The PLACEHOLDER flags — read this first

Every price currently in these files is **invented**. I needed numbers to build
the booking flow and none were published anywhere. They are marked two ways:

1. A `// PLACEHOLDER` comment on the line itself.
2. A `priceIsPlaceholder: true` flag on the package.

While that flag is `true`, the site renders a visible marker next to the price so
nobody mistakes it for real. **Once you have set your actual prices, change the
flag to `false`** and the marker disappears.

The deposit and travel fee live separately in `src/data/site.js`, with the same
flag convention.

## Adding a new package

1. Copy an existing file — `solo.js` is the simplest — and rename it.
2. Change `slug` to something unique and URL-safe (lowercase, hyphens, no spaces).
3. Edit the fields (see the table below).
4. Open `index.js`, add one `import` line at the top and one entry in the
   `packages` array. Position in that array is the display order.

That is the whole process. No other file needs touching.

## The fields

| Field | What it does |
|---|---|
| `slug` | URL-safe id. Must be unique. |
| `name` / `shortName` | Full name for the Services page, short name for wizard cards. |
| `category` | `automotive`, `people` or `service`. Controls which group it appears under. |
| `icon` | Name of an icon from `@untitled-ui/icons-react`. |
| `order` | Sort hint. |
| `tagline` | One line, shown under the name. |
| `summary` | A paragraph. This is where your voice matters most. |
| `bestFor` | Who this is for, in one sentence. |
| `vehicles` / `people` | `{min, max}`. Use `null` for "no limit". |
| `allowsDirectBooking` | `true` = a client can book and pay a deposit without talking first. `false` = the wizard routes them to a free consultation instead. |
| `consultationReason` | Shown when `allowsDirectBooking` is `false`. Explain why. |
| `skipsScheduling` | `true` for work with no shoot date (Editing). Hides the calendar step. |
| `skipsTravel` | `true` for work with no travel (Editing). Hides the travel fee. |
| `quoteOnly` | `true` shows "Quoted individually" instead of a price. |
| `tiers[]` | The options within the package. See below. |
| `notIncluded[]` | Honest exclusions. Being clear here prevents arguments later. |
| `addonIds[]` | Which add-ons from `src/data/addons/` can be attached. |

### Tier fields

| Field | What it does |
|---|---|
| `id` | Unique across the whole site, not just this file. |
| `name` | "Essential", "Extended", etc. |
| `priceCents` | The price, in cents. `null` if `quoteOnly`. |
| `priceFrom` | `true` renders it as "from $X". |
| `durationMinutes` | Used by the calendar to block the right amount of time. |
| `durationLabel` | The human version — "~2.5 hours". |
| `locations` | How many locations are included. |
| `recommended` | `true` highlights this tier. Use it on at most one per package. |
| `blurb` | One line summarising the tier. |
| `includes[]` | The bullet list. Write these as promises you will keep. |

## Removing a package

Delete its `import` line and its entry in the `packages` array in `index.js`.
You can leave the file in place — nothing reads it unless it is in the array.
