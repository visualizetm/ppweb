# Running papsprod.com

Everything needed to deploy this site, and everything Michael can change
himself once it is up.

---

## 1. Environment variables

Set these in Vercel under **Project, Settings, Environment Variables**, for the
Production environment (and Preview if you want previews to work). There are no
`VITE_` variables in this project at all, which means no secret can reach the
browser bundle.

| Variable | Required | What it is |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string. The database name comes from the URI path, so include it: `mongodb+srv://user:pass@cluster/papsprod?retryWrites=true&w=majority` |
| `SESSION_SECRET` | Yes | Random 32+ byte string that signs the admin session cookie. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Changing it signs every admin session out. |
| `ADMIN_PASSWORD` | Yes | The dashboard password. Compared server side only. |
| `CLOUDINARY_URL` | Yes, for image uploads | The single URL from the Cloudinary dashboard (`cloudinary://key:secret@cloud`). Checked first. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Alternative to the above | The same credentials as three variables. Used only when `CLOUDINARY_URL` is not set. Without either style the dashboard works but uploads return a clear "image storage is not connected yet" message. |
| `WEB3FORMS_NOTIFY_KEY` | No | Web3Forms access key, used to email Michael when a booking lands. |
| `NOTIFY_EMAIL` | No | Where those notifications go. |

If either notification variable is missing, bookings are still saved. Only the
email is skipped.

Stripe is **not wired up**. `api/invoices/pay.js` is a deliberate 501 stub and
no Stripe SDK is loaded anywhere. Do not set a Stripe key until that work is
done: the stub's 501 is currently the only thing stopping an invoice being
marked paid from an unauthenticated request.

## 2. First deploy

1. Import the repository into Vercel. The framework preset is Vite; `vercel.json`
   already sets the build command, the output directory and the SPA rewrite.
2. Set the variables above.
3. Deploy.
4. Open the dashboard and sign in with `ADMIN_PASSWORD`: `dashboard.papsprod.com`
   once the domain below is attached, or `/admin` on the Vercel URL before then.

On the first request the API creates its collections, its indexes, and one
`siteContent` document per editable section, seeded with the content the site
shipped with. There is no migration step and nothing to run by hand.

### Domains

One project serves both hostnames off the same build. Add both under
**Settings, Domains**:

| Hostname | Serves |
| --- | --- |
| `papsprod.com` (and `www`) | The public site, plus `/invoice/:token` |
| `dashboard.papsprod.com` | The owner dashboard, at the root |

DNS for the subdomain is a `CNAME` record: `dashboard` pointing at
`cname.vercel-dns.com`. Vercel shows the exact value when you add the domain,
and issues the certificate once the record resolves.

Three things happen automatically once both domains are attached:

- `papsprod.com/admin` redirects to `dashboard.papsprod.com`, so old
  bookmarks keep working (`vercel.json`, `redirects`).
- The dashboard host is served with `X-Robots-Tag: noindex, nofollow`, and the
  app sets the matching meta tag, so it cannot be indexed.
- The admin session cookie is host-only: set on `dashboard.papsprod.com`, it is
  never sent to `papsprod.com`. Nothing about the dashboard session touches the
  public site.

On `localhost` and on `*.vercel.app` preview URLs there is no subdomain, so the
dashboard stays reachable at `/admin` there. That fallback is deliberate: it is
what makes previews testable.

## 3. How the API is packaged

The whole API is **one** Serverless Function: `api/index.js`. It imports
every endpoint from `api/_handlers/` and dispatches on the path.

This is not an aesthetic choice. Vercel turns each routable file under `api/`
into its own function, and the Hobby plan allows twelve per deployment. With one
file per endpoint this project needed sixteen, so the build succeeded and the
**deploy** failed straight afterwards, at the line that reads
`Deploying outputs...`. The limit is checked while functions are packaged, which
is after `vite build` has already reported success.

Routing to it is **explicit**, in `vercel.json`:

```json
{ "source": "/api/:path*", "destination": "/api/index?__route=:path" }
```

That rule exists because the function was first called `api/[...route].js`, and
a bracketed catch-all filename is a Next.js convention that a plain Vite project
does not route. Every API request 404'd with an HTML error page, which the
browser could not parse as JSON, so the dashboard showed a generic
"Something went wrong" for what looked like a password problem. The build was
green throughout. `api/index.js` is an ordinary filename plus an ordinary
rewrite, and depends on no filename interpretation at all.

**Every relative import in `api/` and `shared/` must carry its `.js` extension.**
`package.json` declares `"type": "module"`, so Vercel runs these files as native
Node ESM, and native ESM does not resolve `'../_lib/mongo'`; it needs
`'../_lib/mongo.js'`. One missing extension fails the whole `api/index.js`
module at load, and every route then answers `FUNCTION_INVOCATION_FAILED`
before any handler runs, with no outgoing requests in the trace. That is what
the first production deploy did. `scripts/smoke.sh` now imports `api/index.js`
under native ESM and fails the build if it does not load.

Adding an endpoint is a file in `api/_handlers/` plus one line in the `ROUTES`
map. A leading underscore tells Vercel not to route a path, which is what keeps
`_handlers/` and `_lib/` out of the function count. `scripts/smoke.sh` fails the
build if that count climbs back above twelve, and `scripts/check-routing.mjs`
fails it if any endpoint stops being reachable.

## 4. Collections

| Collection | What is in it |
| --- | --- |
| `bookings` | One per booking request. `ref` (`PP-1001`) is unique. |
| `invoices` | One per invoice. `number` (`INV-2401`) is unique. |
| `siteContent` | One per editable section: `{ section, draft, published, updatedAt, publishedAt }` |
| `publishHistory` | One per publish, with the sections and fields that went out. |
| `counters` | Atomic sequences behind `ref` and `number`. Do not edit by hand. |

Indexes are created automatically on first connection. They are idempotent, so
there is nothing to maintain.

## 5. Draft and published

This is the important idea and it is worth being precise about it.

- Editing anything in the dashboard writes to that section's **draft**. It saves
  by itself about a second after you stop typing.
- The public site reads **published** and nothing else. A draft can sit
  unfinished for a month without anyone seeing it.
- **Publish** is the only thing that copies draft over published. It asks for
  confirmation and lists exactly which sections and fields will go out. You can
  untick any of them.
- Every publish is recorded under **Publish history**.
- **Discard them** on a section throws the draft away and puts it back in step
  with the live site.

Uploading an image is an edit like any other: the photograph goes to storage
immediately, but the page does not use it until you publish.

## 6. What Michael can change without a developer

Every screen under **Site content** in the dashboard sidebar.

| Screen | Covers |
| --- | --- |
| Galleries | Every gallery: title, web address, caption, date, type, location, description, cover photograph, whether it is featured on the home page, and the full photograph set. Add, edit, reorder and delete galleries; add, describe, reorder and remove photographs inside one. |
| Announcement bar | On/off, the message, an optional link and its text, and one of three styles. |
| Hero | Headline, supporting paragraph, both button labels and destinations, the small print under them, the photograph and its description, and the location on the light readout. |
| Home sections | Every heading and subheading below the hero, the four process steps, the testimonials heading, and the closing banner. |
| Pricing | Every package price, the deposit, the travel and turnaround wording, and the "placeholder pricing" notice. |
| About page | Headline, opening line, the story, the photograph and its description. |
| Testimonials | Real client quotes. Empty by default and never seeded with anything invented. |
| FAQ | Questions, answers and their groups, plus which answer gets its own section on the home page. |
| Contact details | Whether contact details are published at all, email, phone, reply time, service area, and the Instagram and Facebook links. |

Adding a new editable field is a change to `shared/content-schema.js` and
nothing else: the form control, the sanitiser, the change summary and the
publish plumbing all follow from the schema.

## 7. Photographs

Uploads go through the browser. A file is resized to a sensible ceiling and
re-encoded as WebP before it is sent, so a 40 MB camera JPEG becomes a few
hundred kilobytes and uploads quickly on a phone. Files land in Cloudinary under
the `papsprod/` folder and are served from its CDN. Nothing is committed to git
and no redeploy is needed.

A whole shoot can go up in one go: select or drag as many photographs as you
like into a gallery. Each one uploads on its own with its own progress bar; one
that fails (wrong format, too large) is marked and can be retried alone while
the rest carry on. Everything lands in the gallery's draft, same as a single
upload, and nothing is on the site until you publish.

Removed or replaced images are destroyed in Cloudinary so they do not pile up,
with one deliberate exception: an image that is still on the live site is kept
until the publish that retires it, and destroyed then.

A handful of images still ship with the build under `public/`, including the
three original gallery covers. Those are served as a three-file set
(`.webp`, `.jpg`, `-thumb.jpg`) produced by `scripts/optimize-images.mjs`.
`src/components/Picture.jsx` handles both kinds, so the two can coexist
indefinitely.

## 8. Checks

```bash
npm run build            # production build
npm run smoke            # build, bundle checks, contrast, every route
SMOKE_OVERFLOW=1 npm run smoke   # the above plus horizontal overflow in a real browser
```

`scripts/smoke.sh` fails the build if a component calls `/api` directly instead
of going through `src/lib/api.js`, if a secret-shaped `VITE_` variable reaches
the bundle, if any colour pair drops below its contrast threshold, or if an
emoji appears in `src/` or `api/`.

## 9. Known gaps

- **Payments are not implemented.** Invoices can be created, sent and viewed.
  Paying one does nothing: `api/invoices/pay.js` returns 501. The invoice page
  still renders from a token in the URL rather than from `getInvoice`, and
  `payInvoice` in `src/lib/api.js` drops the card it is handed. All of this is
  deliberate and scoped to a later pass.
- **Clients, Inquiries, Analytics and Settings** in the dashboard sidebar are
  still stubs that render the dashboard.
- **The galleries have almost no photographs.** Nine galleries, three covers,
  no full sets. The upload path now exists; the photographs still have to go
  through it.
