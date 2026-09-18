# Paps Productions — Discovery Report

Read-only audit of `visualizetm/ppweb` at commit `93f3045`, branch
`claude/paps-productions-rebuild-pekb47` (identical to `main`). Working tree clean.
No source files were modified to produce this report.

---

## 1. Stack and architecture

- **Framework:** React 18.3.1 (`package.json:16-17`). No TypeScript anywhere — every file is `.js` / `.jsx`.
- **Build tool:** Vite 5.4.11 (`package.json:23`). Config at `vite.config.js`.
- **Module system:** ESM — `"type": "module"` (`package.json:4`). `api/` handlers use `export default`, not `module.exports`.
- **Routing:** `react-router-dom` 6.28 (`package.json:18`), client-side only. All routes declared in `src/App.jsx`.
- **Hosting / deploy target:** Vercel. `vercel.json` sets `buildCommand: npm run build`, `outputDirectory: dist`, SPA rewrite `/((?!api/).*)` → `/index.html` (`vercel.json:5`), five security headers, and 1-year immutable caching on `/assets/` and `/galleries/`.
- **Serverless functions:** 11 endpoints under `api/`, Vercel Node functions (`export default async function handler(req, res)`). Three shared modules in `api/_lib/`.
- **Database:** MongoDB via the official `mongodb` driver `^6.12.0` (`package.json:15`). Two collections: `bookings`, `invoices` (`api/_lib/mongo.js:24-25`).
- **Node version:** **unpinned.** There is no `engines` field in `package.json` and no `.nvmrc`. Local runtime is v22.22.2; Vercel will pick its own default.
- **Unusual dependencies:**
  - `sharp` ^0.35.3 and `playwright` ^1.62.0 as devDependencies — used only by the custom scripts in `scripts/`, not by the app.
  - `@babel/runtime` ^7.26.0 as a direct *dependency* — required transitively by `@untitled-ui/icons-react`.
  - `@untitled-ui/icons-react` ^0.1.4 — icon set, imported per-icon from `build/esm/<Name>` so tree-shaking works.
- **Central architectural decision — the demo seam.** Every data call in `src/` goes through `src/lib/dataSource.js`, which re-exports either `src/lib/sources/demo.js` or `src/lib/sources/live.js` based on `import.meta.env.VITE_DEMO_MODE === 'true'` (`src/lib/dataSource.js:19`). `live.js` is the **only** file in `src/` permitted to call `fetch('/api/...')` (enforced by `scripts/smoke.sh`). Both modules export the same 19 names — verified, **no drift**.
- **Content-as-data:** `src/data/{galleries,packages,addons,faqs,availability}/`, each a directory of plain JS objects with a `README.md`. `src/data/site.js` holds site-wide config.
- **Custom scripts** (`scripts/`): `smoke.sh`, `check-contrast.mjs`, `check-overflow.mjs`, `optimize-images.mjs`, `sample-paint.mjs`, `screenshot.mjs`. Only `smoke` is wired into `package.json` scripts.

---

## 2. Frontend inventory

All routes are declared in `src/App.jsx`. Marketing pages render inside the nav/footer chrome; `/admin/*` and `/invoice/:token` render outside it.

| Route | Component | Data | State |
|---|---|---|---|
| `/` | `src/pages/Home.jsx` | static (`src/data/`) | finished, one placeholder section |
| `/portfolio` | `src/pages/Portfolio.jsx` | static `src/data/galleries` | finished; content empty |
| `/portfolio/:slug` | `src/pages/Gallery.jsx` | static | finished; renders placeholders |
| `/about` | `src/pages/About.jsx` | static | finished |
| `/services` | `src/pages/Services.jsx` | static `src/data/packages` | finished; **prices are placeholders** |
| `/faq` | `src/pages/Faq.jsx` | static `src/data/faqs` | finished |
| `/contact` | `src/pages/Contact.jsx` | static `src/data/site` | finished; **no form** |
| `/booking` | `src/pages/Booking.jsx` | fetched (`getBookedSlots`, `submitBooking`) | finished |
| `/invoice/:token` | `src/pages/Invoice.jsx` (lazy) | token-encoded | **demo-only, breaks in production** |
| `/admin/*` | `src/pages/admin/Admin.jsx` (lazy) | fetched | partly built — see section 3 |
| `*` | `src/pages/NotFound.jsx` | static | finished |

### Landing page sections

`src/pages/Home.jsx:19-25` renders seven components from `src/components/home/`:

1. `Hero.jsx` — finished. Background image `public/brand/hero.{webp,jpg}` exists.
2. `Featured.jsx` — finished code, **empty content**. Maps `featuredGalleries` (`src/data/galleries/index.js:33`) through `GalleryCard`.
3. `HowManyPhotos.jsx` — finished, static copy.
4. `ServicesPreview.jsx` — finished, reads `src/data/packages`.
5. `Process.jsx` — finished, static copy.
6. `Testimonials.jsx` — **deliberate placeholder.** The `testimonials` array at line 19 is empty with the real shape commented out; the component renders three labelled empty slots and the line "This section is ready and waiting on real quotes. Nothing here is invented." (line 42). Intentional — no fabricated reviews.
7. `CtaBand.jsx` — finished, links to `/booking`.

### Is the photo showcase wired to real images?

**Wired, but there are almost no images.**

- `src/components/Picture.jsx` resolves an extension-less path to `.webp` (via `<source>`), `.jpg` (the `<img>`), and `-thumb.jpg` (LQIP). When `src` is `null` it renders a labelled dashed `.slot` placeholder instead.
- `public/` contains **39 files total**. Of those, only **three gallery covers** exist: `public/galleries/{solo-shoot-101125,duo-shoot-10825,rain-solo-shoot-91825}/cover.{webp,jpg,-thumb.jpg}`.
- There are **9 galleries** registered (`src/data/galleries/index.js:12-22`). **All 9 have `images: []`.** Six of the nine have `cover: null`.
- `public/brand/unassigned/img2..img6` are five optimised images that are downloaded and processed but referenced by **no data file** — orphaned assets.
- `src/pages/Gallery.jsx:30` computes `hasImages`; when false it draws numbered `.slot` placeholders (line 92) plus explanatory copy (line 102). So every gallery page currently renders as a grid of empty frames.

**Net:** the showcase plumbing is complete and correct. The photographs were never migrated — the old Adobe Portfolio CDN (`cdn.myportfolio.com`) and `papsprod.com` are blocked by this environment's network policy, so no image could be fetched. Each data file carries a `sourceUrl` pointing at the original Adobe Portfolio page for reference; those URLs are never rendered or linked.

### Booking flow — full trace

1. **Entry.** CTAs across `Hero.jsx`, `CtaBand.jsx`, `ServicesPreview.jsx`, the nav and the footer all link to `/booking`.
2. **Intro screen.** `src/pages/Booking.jsx` starts at `stage === 'intro'` (line 276) — a title card, not yet the wizard.
3. **Wizard.** Six steps, defined in `STEPS` (`src/pages/Booking.jsx`):
   `shoot` → `car` → `when` → `wants` → `you` → `review`.
4. **Availability.** Step `when` calls `getBookedSlots()` (imported line 22). Slot generation is real: `src/lib/sun.js` computes sunrise/sunset from the NOAA solar equations for the shoot location; `src/lib/slots.js` derives sun-relative blocks (e.g. `golden-evening` uses `beforeSunsetMinutes`); `src/lib/tz.js` pins everything to `America/New_York` via `Intl` so the visitor's own timezone cannot shift a slot.
5. **Submit.** Line 261: `const res = await submitBooking(payload)`. On failure it throws and shows "That did not send… nothing was lost." On success it stores `res.booking` and advances to `done`.
6. **Where the request lands — two different places depending on the flag:**

   - **Demo (`VITE_DEMO_MODE=true`, the current state):** `src/lib/sources/demo.js` writes into an in-memory state object mirrored to **`sessionStorage`** under `pp_demo_state_v1` (lines 16, 43). The booking is set `status: 'new'` and immediately appears in the admin dashboard **in the same browser tab**. It is gone when the tab closes. Nothing leaves the browser.
   - **Live (`VITE_DEMO_MODE=false`):** `src/lib/sources/live.js:77` POSTs to `/api/bookings`. `api/bookings.js` validates `contact.name` (required) and `contact.email` against a regex (lines 14-17), truncates every field, whitelists `packageSlug` against `TYPES`, clamps `vehicleCount` to 1-40 and `peopleCount` to 0-60, builds a document with `ref: PP-<last 6 digits of Date.now()>`, `status: 'new'`, `read: false`, and `insertOne`s it into the `bookings` collection (line 48). A Web3Forms notification email fires afterwards inside `Promise.allSettled` so a mail failure cannot fail the booking (line 51). Returns `200 {ok, booking}`.

**Verdict:** the booking flow is complete and correct end to end **in demo mode** — traced from CTA to a stored record to the admin list, working today. The live path is fully written and internally consistent, but has **never been executed against a real MongoDB** — no `MONGODB_URI` has ever been set in this repo's history and no deployment exists to have run it. It is unverified, not known-broken.

---

## 3. Admin panel inventory

Single route `/admin/*` → `src/pages/admin/Admin.jsx` (1 file, 34 KB) + `AdminStyles.jsx`. There are **no sub-routes** — navigation is `useState`, so the URL never changes and admin views are not linkable, bookmarkable, or back-button navigable.

### Auth

- **Gate:** `Admin.jsx:169` calls `getSession()` on mount and sets `authed`. If false, the `Login` component (line 65) renders instead of the dashboard.
- **Demo mode:** `demo.js login()` (line 85) **accepts any password**, including an empty one, and writes `pp_demo_session_v1` to `sessionStorage`. The login screen states this on screen.
- **Live mode:** `live.js:68` POSTs to `/api/admin/login`. `api/admin/login.js:6` calls `passwordOk()`, which SHA-256 hashes both the supplied password and `process.env.ADMIN_PASSWORD` and compares with `crypto.timingSafeEqual` (`api/_lib/auth.js:55-61`). On failure it sleeps 400 ms and returns a deliberately vague 401. On success it sets `pp_session`, a stateless token `base64url("<expiryMs>.<HMAC-SHA256>")` signed with `SESSION_SECRET`, 12-hour TTL, `HttpOnly; Secure; SameSite=Lax; Path=/` (`api/_lib/auth.js:13-16, 35-36`).
- Every admin endpoint begins with `if (!requireAdmin(req, res)) return;` — verified present in `api/admin/bookings.js:9`, `api/admin/invoices.js:12`, `api/admin/stats.js:7`.
- **The password is never in a `VITE_` variable.** Confirmed by grep: the only `VITE_` variable in the codebase is `VITE_DEMO_MODE`.
- **Note:** if `SESSION_SECRET` is unset, `checkToken` returns false for everything (`api/_lib/auth.js:19`), so admin locks out entirely rather than failing open. If `ADMIN_PASSWORD` is unset, `passwordOk` returns false unconditionally (line 57). Both fail closed — correct.

### Navigation vs reality

Eight sidebar items across two groups (`Admin.jsx:48-60`):
`dashboard`, `bookings`, `clients` | `inquiries` (with unread badge), `invoices`, `galleries`, `analytics`, `settings`.

The view switch is at `Admin.jsx:321-327`:

```
open ? <BookingDetail .../>
: view === 'invoices'  ? <InvoicesView .../>
: view === 'galleries' ? <GalleriesView />
: <the dashboard>
```

**Only 2 of 8 nav items render a distinct screen.** The other six — `dashboard`, `bookings`, `clients`, `inquiries`, `analytics`, `settings` — all fall through to the identical dashboard body. The only thing that changes is the `<h1>` (line 330), which looks up the clicked item's label. **Why:** these views were never built; the nav was designed for the finished product and the switch has no branches for them. Not a bug — unfinished scope.

Item by item:

- **dashboard** — real. Four `StatCard`s (completed, conversion, awaiting deposit, revenue) plus upcoming shoots, fed by `getDashboardStats()`. Four tabs (`Overview`, `Bookings`, `Clients`, `Revenue`, line 62) switch the body within this one view.
- **bookings** — **does nothing distinct.** Renders the dashboard. Bookings *are* reachable: the dashboard list rows call `setOpenId`, which opens `BookingDetail` (line 485).
- **clients** — **does nothing.** No client model exists anywhere in the codebase.
- **inquiries** — **does nothing distinct.** The badge count is real (`stats.unread`), and `api/admin/stats.js:58` does derive an `inquiries` array from bookings that have `shotNotes`, but there is no screen that lists them.
- **invoices** — real. `InvoicesView` (line 719) lists invoices from `listInvoices()`.
- **galleries** — real but **read-only and informational only.** `GalleriesView` (line 761) renders a count and a list of `galleriesMissingImages` (`src/data/galleries/index.js:39`) with the instruction to "Drop optimised files into `public/galleries/<slug>/` and list them in the gallery's data file". **There is no upload control, no file input, and no image-management API.**
- **analytics** — **does nothing.** No analytics provider is integrated anywhere in the repo.
- **settings** — **does nothing.** No settings model or endpoint exists.

### Where booking submissions land, and whether they actually do

**Yes, in demo mode — verified end to end.** `Admin.jsx:173` runs `Promise.all([listBookings({search: query}), getDashboardStats(), listInvoices()])`. In demo these read the same `sessionStorage` object the booking wizard wrote to, so a booking submitted in one tab appears in the admin in that same tab immediately.

In live mode `listBookings` hits `GET /api/admin/bookings`, which queries the `bookings` collection with optional `status` / `packageSlug` / `unreadOnly` filters and a regex `$or` search across name, email, phone, title, ref, notes and shotNotes — with the search string escaped before becoming a regex (`api/admin/bookings.js:6, 28`), so a phone number containing `(` cannot throw. Sorted `createdAt: -1`, capped at 200. Status changes go through `PATCH` with a strict whitelist (`STATUS`, line 5) and an explicit "Never spread req.body into a $set" comment (line 55). This code is sound; it has simply never been run against a database.

### Invoicing (the most complete admin feature)

`BookingDetail` (line 485) suggests line items from the booking (`suggestLines`, line 710), lets you set kind/due date, and calls `createInvoice` (line 503) → `POST /api/admin/invoices`. That handler creates `INV-<2400+count+1>`, computes totals server-side from the line items, inserts the document, and flips the booking to `status: 'quote sent'` (`api/admin/invoices.js:57`). The admin then gets a copyable link plus prefilled SMS text.

---

## 4. Data layer

- **Database:** MongoDB (Atlas assumed — nothing pins it).
- **Connection:** `api/_lib/mongo.js`. A single `MongoClient(...).connect()` promise cached on `globalThis.__ppMongo` so warm Lambda invocations reuse the pool (lines 8-9, 13-17). `maxPoolSize: 5`, `serverSelectionTimeoutMS: 8000`. The **database name is taken from the URI path** (`client.db()` with no argument, line 21) — there is no separate DB-name variable.
- **Env var:** `MONGODB_URI` (`api/_lib/mongo.js:6`). If unset, `db()` throws `'MONGODB_URI is not set'` (line 12).
- **Collections:** exactly two — `bookings` and `invoices` (lines 24-25).
- **No schema validation, no migrations, no ODM, no indexes.** Nothing in the repo creates an index; `api/admin/bookings.js` does an unindexed regex `$or` scan, and `api/admin/stats.js:13` pulls up to 500 documents into memory on every dashboard load.

### `bookings` — actual document shape, read from `api/bookings.js:19-44`

| Field | Type | Notes |
|---|---|---|
| `ref` | string | `PP-<last 6 digits of Date.now()>` — **not unique, no uniqueness check** |
| `createdAt`, `updatedAt` | Date | |
| `packageSlug` | string\|null | whitelisted against `['solo','duo','group','event','portrait','wedding','editing']` |
| `tierId`, `tierName` | string\|null | |
| `title` | string | defaults `'New booking'` |
| `vehicle` | object\|null | `{year, make, model, color}` |
| `vehicleCount` | number | clamped 1-40 |
| `peopleCount` | number | clamped 0-60 |
| `locationPref` | string | ≤300 chars |
| `shotNotes` | string | ≤2000 chars |
| `scheduledAt` | Date\|null | |
| `durationMinutes` | number\|null | |
| `flexible` | boolean | |
| `contact` | object | `{name, email, phone, source}` — name and email validated |
| `status` | string | `'new'`; transitions whitelisted to `['new','reviewing','quote sent','deposit paid','scheduled','shot','delivered','cancelled']` (`api/admin/bookings.js:5`) |
| `read` | boolean | |
| `notes` | string | admin-only, ≤4000 chars |
| `messageCount` | number | **written as `1` and never incremented anywhere** |
| `invoices` | array | **written as `[]` and never appended to** — `api/admin/invoices.js` stores `bookingId` on the invoice instead. Half-migrated: one of these two directions is dead. |

### `invoices` — actual shape, read from `api/admin/invoices.js:35-54`

`number` (`INV-<2400+count+1>`), `bookingId` (string, not ObjectId), `title`, `customerName`, `customerEmail`, `lines[]` (`{description, quantity, amountCents}`), `kind` (`deposit`\|`balance`\|`full`), `dueDate`, `totalCents`, `amountDueCents`, `issuedAt`, `viewedAt`, `paidAt`, `voidedAt`.

Totals are recomputed server-side from the line items (line 30) — the client cannot dictate an amount.

### Flags

- **`number` and `ref` collide under concurrency.** `INV-` uses `countDocuments({})` (line 33) — two invoices created in the same tick get the same number. `PP-` uses a timestamp slice. Neither has a unique index.
- **`invoices: []` on the booking is dead.** Nothing writes to it.
- **`messageCount` is dead.** Always 1.
- **`bookingId` is stored as a string** while `_id` is an ObjectId, so joining requires a cast — done correctly at `api/admin/invoices.js:27`, but it is a trap.
- **No connection has ever been made.** `MONGODB_URI` has never been set in this repo or any deployment. The entire data layer is written but unexercised.

---

## 5. Media handling

- **Storage: local only.** Everything lives in `public/` and is served by Vercel's static CDN. There is **no** Cloudinary, S3, Vercel Blob, or any other media service — no such dependency or env var exists.
- **Serving:** `src/components/Picture.jsx` takes an extension-less path and renders `<picture>` with a `.webp` `<source>`, a `.jpg` `<img>` fallback, and a `-thumb.jpg` low-quality placeholder. `vercel.json:23-27` caches `/galleries/*` for a year, immutable.
- **Processing:** `scripts/optimize-images.mjs` (sharp) produces the `.webp` / `.jpg` / `-thumb.jpg` triplet. Run manually; not part of the build.
- **How a new photo gets added today — code only:**
  1. Drop the source file somewhere and run `node scripts/optimize-images.mjs`.
  2. Put the output triplet in `public/galleries/<slug>/`.
  3. Edit `src/data/galleries/<slug>.js` to add the entry to `images` (or set `cover`).
  4. Commit and push; Vercel rebuilds.
- **There is no admin panel path for this.** `GalleriesView` (`Admin.jsx:761`) only *tells you* to do the above. No `<input type="file">`, no upload endpoint, no write path for media exists anywhere in `api/`. Michael cannot add a photo without a developer.
- **Old-site assets were never migrated.** Network policy blocks `papsprod.com` and `cdn.myportfolio.com`. The three covers that exist were obtained before that block. Nothing hotlinks the Adobe CDN.

---

## 6. Environment variables and secrets

Full list, from grep of `process.env` and `import.meta.env` across `api/`, `src/`, `scripts/` and `vite.config.js`.

| Variable | Read at | Purpose | Status |
|---|---|---|---|
| `VITE_DEMO_MODE` | `src/lib/dataSource.js:19`, `vite.config.js:24` | Public build flag. Selects demo vs live data source; also gates the `noindex` meta tag. | **Set** — `.env.production:11` = `true` (committed, not gitignored) |
| `MONGODB_URI` | `api/_lib/mongo.js:6` | Mongo connection string; DB name comes from the URI path. | **Unset** — never configured anywhere |
| `SESSION_SECRET` | `api/_lib/auth.js:6` | HMAC key for the `pp_session` cookie. | **Unset** — admin cannot authenticate without it |
| `ADMIN_PASSWORD` | `api/_lib/auth.js:56` | The admin dashboard password, compared server-side. | **Unset** — login fails closed |
| `WEB3FORMS_NOTIFY_KEY` | `api/_lib/notify.js:7` | Web3Forms access key for booking notification email. | **Unset** — `sendEmail` returns `{ok:false, skipped:'not configured'}` and silently no-ops |
| `NOTIFY_EMAIL` | `api/_lib/notify.js:8` | Destination for booking notifications. | **Unset** — same |
| `STRIPE_SECRET_KEY` | `api/invoices/pay.js:20` | Gates the payment stub. | **Unset** — `/api/invoices/pay` returns `501 not_implemented` |
| `VERCEL_GIT_COMMIT_SHA` | `vite.config.js:30` | Injected into `__BUILD_SHA__`; falls back to `'dev'`. | Set by Vercel automatically |
| `OVERFLOW_WIDTHS` | `scripts/check-overflow.mjs` | Test-only viewport list. | Optional |
| `import.meta.env.DEV` | `src/lib/dataSource.js` | Gates the DEV-only drift warning. | Vite built-in |

**Documented but referenced by no code:**

- `STRIPE_WEBHOOK_SECRET` — in `.env.example:47` and `DEMO-TO-PRODUCTION.md`. No webhook handler exists.
- `VITE_STRIPE_PUBLISHABLE_KEY` — in `.env.example:49`. Nothing reads it; no Stripe JS is loaded.

**Security posture — verified clean.** The only `VITE_`-prefixed variable that exists is `VITE_DEMO_MODE`, a public feature flag. No password, session secret, database URI or API key is ever exposed to the client bundle. `.gitignore` covers `.env`, `.env.local`, `.env.*.local` and `.vercel`. `.env.production` is committed deliberately and contains only the public flag.

**Net effect right now: every server-side variable is unset.** With `VITE_DEMO_MODE=true` this is harmless — nothing calls the API. The moment the flag flips to `false` without setting them, the site breaks completely.

---

## 7. Known issues

**Clean signals first:** zero `TODO`, `FIXME`, `XXX` or `HACK` comments in `src/`, `api/` or `scripts/`. Zero `console.log` and zero `console.error`. Exactly one `console.warn` — `src/lib/dataSource.js:30`, a DEV-only guard that fires if `demo.js` and `live.js` export different names (verified: they don't).

### Will throw or fail in production (`VITE_DEMO_MODE=false`)

1. **`/invoice/:token` is broken in production.** `src/pages/Invoice.jsx:49` builds the invoice *solely* from `decodeInvoice(token)` — a base64url-encoded JSON blob in the URL. It **never calls `getInvoice`**, even though that function exists in both data sources and `api/invoices.js` is written and working. A production invoice id would fail to decode and the page renders "This link doesn't work." Compounding it, `invoiceState` (localStorage, key `pp_demo_invoices_v1`, `src/lib/invoiceToken.js:25`) is read unconditionally at lines 51, 64 and 113 with no `isDemo` guard, so production payment status would be mirrored into browser storage.
2. **`payInvoice` throws away the card.** `src/pages/Invoice.jsx:107` calls `payInvoice({invoiceId, card, billingName})`. `src/lib/sources/live.js:106` destructures only `{invoiceId, paymentMethodId}` — `card` is dropped and `paymentMethodId` is **always `undefined`**. The request that reaches the server carries no payment information at all.
3. **`api/invoices/pay.js` is an explicit stub** that documents itself as "MUST NOT SHIP AS-IS". It returns `501 not_implemented` unless `STRIPE_SECRET_KEY` is set — and if that key *is* set, it marks the invoice paid **straight from an unauthenticated client request**, with `/* --- Stripe confirmation goes here --- */` as the only placeholder. Setting `STRIPE_SECRET_KEY` today would create a free-money endpoint. The 501 is currently the only thing preventing that.
4. **Unset env vars cascade.** With `MONGODB_URI` unset every API route 500s; with `SESSION_SECRET` unset admin login always fails; with the Web3Forms vars unset booking notifications silently never send (`api/_lib/notify.js:9` — no log, no error, no trace).

### Half-finished features

5. **Six of eight admin nav items are non-functional** (section 3). `clients`, `analytics` and `settings` have no backing model at all.
6. **Admin has no routing.** `/admin/invoices` does not exist; the URL is always `/admin`. State is lost on refresh.
7. **No image management.** `GalleriesView` is a read-only to-do list, not a tool.
8. **Dead code through the seam:** `getBooking`, `getInvoice`, `voidInvoice` and `capabilities` are implemented in both `demo.js` and `live.js` and exported from `dataSource.js`, but have **zero call sites** in any component. `getInvoice` is the one that matters — it is exactly the function `Invoice.jsx` needs and does not use.
9. **Dead schema fields:** `booking.invoices[]` and `booking.messageCount` are written once and never touched again (section 4).

### Content gaps that will read as broken to a visitor

10. **Nine galleries, zero photographs.** All `images: []`; six covers are `null`. `/portfolio` advertises "9 galleries" and every one of them renders empty frames.
11. **All pricing is invented placeholder data.** Eleven `priceCents` values across `src/data/packages/*.js` are marked `// PLACEHOLDER`. `Services.jsx` is honest about it — it renders a "Placeholder pricing" banner (line 51-55) and a `placeholder` chip beside each figure — but these are still fictional numbers on a public commercial site.
12. **No published contact details.** `src/data/site.js:26-32` has `published: false` with a placeholder email and a `555` phone number. `/contact` renders a "coming soon" state rather than a fake address. **There is no contact form on `/contact` at all** — only `mailto:` and `tel:` links (`Contact.jsx:112, 124`). The only way to reach Michael through the site is the booking wizard.
13. **No testimonials.** Deliberate (section 2), but the section ships as three empty slots.
14. **Five orphaned images** in `public/brand/unassigned/` referenced by nothing.

### Commented-out blocks

Only one, and it is intentional: the example testimonial shape at `src/components/home/Testimonials.jsx:20-24`, kept as the template to fill in.

---

## 8. Deploy and domain status

- **Deployed: nowhere.** There is **no `.vercel` directory** in the repo (only `vercel.json`), no Vercel project has been linked in any session, no deployment has ever been triggered, and there is no preview or production URL for this codebase.
- **Domains:** `papsprod.com` is the client's existing domain and still serves the **old static site**. It is not pointed at this repo. `mpappasproductions.myportfolio.com` is the original Adobe Portfolio, referenced as `sourceUrl` metadata in the gallery data files but never linked from the site.
- **Build script:** `npm run build` → `vite build` (`package.json:7`), output to `dist/`, matching `vercel.json:3-4`. **Verified working:** clean `npm ci` (93 packages) followed by `npm run build` succeeds in 1.53s, 134 modules transformed, no warnings. Largest chunks: `vendor` 164 KB (53.6 KB gzip), `index` 125 KB (36.4 KB gzip), `Admin` 46.8 KB lazy, `Booking` 33.7 KB lazy. Code splitting works — `Admin`, `Invoice`, `Booking` and every marketing page are separate chunks.
- **Demo guard confirmed in the artifact:** `dist/index.html` contains the `noindex, nofollow` meta tag, injected by the `pp-demo-noindex` plugin (`vite.config.js:9-20`) because `.env.production` sets `VITE_DEMO_MODE=true`. A production build (flag `false`) omits it entirely — nothing to remember to remove.
- **Drift:** none between branches. `claude/paps-productions-rebuild-pekb47` and `main` are both at `93f3045`; local and `origin` match; working tree clean. The only drift that exists is **repo vs live domain** — 100%, because the live domain has never seen this code.
- **Other deploy notes:** no CI (`.github/workflows` does not exist). No `engines` field, so Vercel picks its own Node version. `scripts/smoke.sh` is the only automated check and must be run by hand.

---

## Prioritized triage

### BROKEN — exists, is wired up, does the wrong thing

1. **`api/invoices/pay.js` marks invoices paid from an unauthenticated client request.** Setting `STRIPE_SECRET_KEY` turns this into a free-money endpoint. The `501` guard is all that stands between the current state and that. Highest severity by a distance, even though it is currently inert.
2. **`/invoice/:token` cannot work in production.** `Invoice.jsx:49` decodes the URL token and never calls `getInvoice`, even though `api/invoices.js` and both data-source implementations are complete. Every invoice link breaks the moment the demo flag flips.
3. **`live.js payInvoice` drops the card object** (`live.js:106`) and sends `paymentMethodId: undefined` on every call.
4. **`Invoice.jsx` writes payment state to `localStorage` unconditionally** — no `isDemo` guard on lines 51, 64, 113.
5. **Six admin nav items silently render the dashboard** (`Admin.jsx:321-327`). Clicking `clients` or `settings` looks like the app is ignoring you.
6. **Dead schema fields** — `booking.invoices[]` and `booking.messageCount` are written and never used; the booking↔invoice relationship is half-migrated in two directions.
7. **`INV-` numbering uses `countDocuments`** (`api/admin/invoices.js:33`) — duplicate invoice numbers under concurrency, no unique index.
8. **Booking notification failures are completely silent** (`api/_lib/notify.js:9`). If the Web3Forms vars are wrong, Michael never learns a booking arrived and there is no trace anywhere.

### MISSING — needs to be built

1. **Photographs.** Nine galleries, `images: []` in all nine, six covers `null`. This is the single biggest gap — the site is a portfolio with no portfolio.
2. **An image upload path in the admin.** Today adding a photo requires a developer, a sharp script run, a data-file edit and a redeploy. `GalleriesView` only describes the manual process.
3. **Real pricing.** Eleven placeholder `priceCents` values across `src/data/packages/`.
4. **Real contact details.** `site.js` has `published: false` and a `555` number.
5. **Admin routing.** `/admin/*` is a single stateful component; no URL reflects the current view.
6. **Admin screens:** clients, inquiries list, analytics, settings — four views with no backing model or endpoint.
7. **A Stripe integration** — `api/admin/invoices.js:5-9` documents where it goes; `STRIPE_WEBHOOK_SECRET` and `VITE_STRIPE_PUBLISHABLE_KEY` are documented but read by nothing; no webhook handler exists.
8. **A contact form.** `/contact` is links only.
9. **Testimonials.** Intentionally empty, still a visible gap.
10. **Any deployment at all.** No Vercel project, no domain pointing here, and consequently **the entire `api/` layer plus MongoDB has never once been executed.**
11. **Database indexes** on `bookings.createdAt`, `bookings.status`, `bookings.read` and `invoices.issuedAt`, plus unique indexes on `ref` and `number`.
12. **A pinned Node version** (`engines` in `package.json`) and CI to run `scripts/smoke.sh`.

### WORKS — leave alone

1. **The booking wizard, end to end in demo mode.** Six steps, real solar math (`sun.js`), timezone-correct slot generation pinned to `America/New_York` (`tz.js`, `slots.js`), validated submit, confirmation screen, record visible in the admin. Traced and confirmed.
2. **`api/bookings.js`.** Correct validation, field truncation, enum whitelisting, numeric clamping, notification isolated in `Promise.allSettled`.
3. **`api/admin/bookings.js`.** Regex escaping before search, strict status whitelist, explicit refusal to spread `req.body` into `$set`.
4. **The auth layer** (`api/_lib/auth.js`). Stateless HMAC cookie, `timingSafeEqual` with a length check first, `HttpOnly; Secure; SameSite=Lax`, fails closed when secrets are missing, vague 401 with a 400 ms delay.
5. **The secrets posture.** Exactly one `VITE_` variable and it is a public flag. Nothing sensitive can reach the bundle.
6. **The demo seam** (`dataSource.js`). 19 exports, both sides in sync, single chokepoint for `fetch`, DEV drift warning, enforced by `smoke.sh`.
7. **`api/_lib/mongo.js`.** Correct cached-promise pattern for serverless; bounded pool; DB name from the URI.
8. **`Picture.jsx` and the media pipeline.** WebP + JPEG + LQIP, graceful labelled placeholders, year-long immutable caching.
9. **The build.** Clean `npm ci` + `vite build`, 1.53s, no warnings, correct code splitting, `noindex` injected at build time so there is nothing to remember to remove on promotion.
10. **The honesty guardrails.** No invented testimonials, placeholder prices visibly labelled as placeholders, contact details gated behind `published: false` rather than faked. Keep these.
11. **The layout fixes from `93f3045`.** `fieldset { min-width: 0 }`, `minmax(min(Npx,100%), 1fr)` grids, runtime-measured `--nav-h`, and `scripts/check-overflow.mjs` as a permanent regression assertion.
12. **`src/data/` as a content layer.** Plain objects with per-directory READMEs; `site.js` is genuinely a single edit point.

---

## Two things worth saying plainly

**This codebase has never touched a database or a server.** Every `api/` handler is written, reviewed and internally consistent — and not one of them has been executed. Nothing in section 4 or the live half of section 2 is *verified*; it is *plausible*. Budget for the first live deploy surfacing real bugs.

**The demo flag is load-bearing in a way that hides three defects.** `VITE_DEMO_MODE=true` is the only reason items 1-4 in BROKEN are not live problems. Flipping that one line in `.env.production` is described in `DEMO-TO-PRODUCTION.md` as "the entire promotion path" — it is not. Fix the invoice page, the `payInvoice` signature and `api/invoices/pay.js` before that flag ever changes.
