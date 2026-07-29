# Demo to production

This site is running in **demo mode**. Everything works — you can browse it,
send a booking, build a quote, open an invoice link and pay it — but nothing
persists past the browser and nothing is sent to anyone.

**Turning it into the real thing does not require any code changes.** It is
one line, plus some accounts. This document is the whole list.

---

## What demo mode is doing right now

| Thing | In the demo | In production |
|---|---|---|
| Bookings | Held in `sessionStorage`, seeded with 14 invented ones | MongoDB |
| Admin password | Any password works | Checked server-side against `ADMIN_PASSWORD` |
| Payments | Stubbed. No Stripe SDK, no keys, no network calls | Stripe |
| Invoice links | Payload encoded in the URL | Real Stripe invoice IDs |
| Emails | Nobody is emailed, ever | Web3Forms notification to Michael |
| Search engines | `noindex, nofollow` | Indexed normally |
| Demo badge | Bottom-left on every page | Gone |
| Placeholder price markers | Visible next to invented prices | Gone once prices are confirmed |

All of that is driven by one flag, so it disappears together.

---

## The flip

`.env.production` in the repo root:

```
VITE_DEMO_MODE=true
```

Change it to `false`, commit, redeploy. That is the flip.

Everything below has to be in place *before* you flip it, or the site will
start calling API endpoints that have nothing behind them.

`VITE_DEMO_MODE` is the **only** `VITE_`-prefixed variable this project allows
anywhere near auth, and it is safe because it is a public feature flag rather
than a secret. See the security note at the bottom.

---

## 1. Database

1. Create a free MongoDB Atlas cluster.
2. Add a database user and allow access from anywhere (`0.0.0.0/0`) — Vercel's
   functions do not have fixed IPs.
3. Copy the connection string. The database name comes from the URI path, so
   make sure it ends with something like `/papsprod`.

Set in Vercel → Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/papsprod
```

## 2. Admin session

```
SESSION_SECRET=<32+ random bytes>
ADMIN_PASSWORD=<the password Michael will actually type>
```

Generate the secret with:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Sessions are stateless signed cookies — `HttpOnly`, `Secure`, `SameSite=Lax` —
so there is no session store to run.

## 3. Notifications

```
WEB3FORMS_NOTIFY_KEY=<from web3forms.com>
NOTIFY_EMAIL=<where booking alerts should land>
```

A notification failure never fails a booking. The booking is written first and
the email is fired afterwards, so a dead mail provider cannot lose a customer.

## 4. Stripe

The demo has **no Stripe SDK, no keys, and makes no network calls**. Payment
functions resolve locally after about 1.2 seconds so the processing state is
visible.

**The real-world equivalent of what has been built is Stripe Invoicing (or
Payment Links), which does exactly this natively.** Michael creates an invoice,
Stripe hosts a page, he sends the link, the customer pays, a webhook tells the
app. So production is mostly *deleting* the stub and calling Stripe — not
building a payment system.

1. Create a Stripe account and finish onboarding so it can take live payments.
2. In test mode, copy the secret and publishable keys.
3. Implement these endpoints in `api/` — the client already calls them, with
   the exact shapes in `src/lib/sources/live.js`:
   - `POST /api/admin/invoices` → create a Stripe invoice, return its id and URL
   - `GET /api/invoices?id=` → fetch one
   - `POST /api/invoices/pay` → confirm the payment intent
   - `POST /api/invoices/viewed` → record the first open
4. Add a webhook endpoint for `invoice.paid` and `invoice.payment_failed` and
   set `STRIPE_WEBHOOK_SECRET` from the signing secret Stripe gives you.
5. Test the whole loop in **test mode** with card `4242 4242 4242 4242`.
6. Swap in the live keys.

```
STRIPE_SECRET_KEY=sk_live_...          # server-side ONLY
STRIPE_WEBHOOK_SECRET=whsec_...        # server-side ONLY
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...  # safe client-side
```

## 5. The `api/` directory is not written yet

The client half of production is complete — `src/lib/sources/live.js` defines
every call with its exact request and response shape. The serverless functions
those calls expect **have not been built**. Before flipping the flag you need,
under `api/`:

- `_lib/mongo.js` — cached `MongoClient` on `globalThis` so warm invocations
  reuse the connection
- `_lib/auth.js` — HMAC-signed cookie sessions, `timingSafeEqual` compare
- `_lib/notify.js` — email, swallowing its own errors
- `bookings.js`, `availability.js`
- `admin/login.js`, `admin/logout.js`, `admin/session.js`,
  `admin/bookings.js`, `admin/stats.js`, `admin/invoices.js`
- `invoices.js`, `invoices/pay.js`, `invoices/viewed.js`

This is the single largest remaining piece of work.

## 6. Deploy and verify

1. Set every variable above in Vercel.
2. Set `VITE_DEMO_MODE=false` in `.env.production`, commit, push.
3. Check the build stamp in the footer matches the commit you just pushed —
   that turns "did my change deploy?" into a glance.
4. Send a real booking through `/booking`. Confirm it lands in `/admin` and
   that the notification email arrives.
5. Build a quote, request payment, open the invoice link **on a phone**, and
   pay it with a Stripe test card.
6. Point `papsprod.com` at the Vercel project.

---

## The one deliberate deviation from the demo-mode spec

The skill says demo state lives in `sessionStorage`. **Invoice payment status
does not — it uses `localStorage`, under the namespaced key
`pp_demo_invoices_v1`.**

This is deliberate. The entire point of an invoice link is that Michael sends
it and the customer opens it *somewhere else* — another tab, another browser,
their phone. `sessionStorage` is empty there, so the invoice would not exist and
the demo would fail at exactly the moment it needs to be convincing.

Two things follow from that:

- **The invoice payload is encoded into the token itself** — base64url JSON in
  the URL. The invoice page renders entirely from the token with no shared
  state, so a pasted link works cold on any device. Links come out around 450
  characters.
- **Payment status mirrors to `localStorage`**, so paying in one tab shows up in
  the admin in another on the same machine. That is what makes the two-role
  walkthrough work.

Both are demo-only. In production the token becomes a real Stripe invoice ID and
the payload lives server-side, so the URL gets much shorter and none of this
applies. The admin's **Reset demo data** control clears this namespace too.

---

## Security rules that do not bend

**Never put a secret in a `VITE_` variable.** Vite inlines every `VITE_`
variable into the public client bundle, where anyone can read it with
view-source. `scripts/smoke.sh` fails the build if a secret-shaped `VITE_`
variable ever reaches `dist/`.

Passwords and secret keys are read **server-side only**. The browser never sees
`ADMIN_PASSWORD`, `SESSION_SECRET`, `MONGODB_URI` or `STRIPE_SECRET_KEY`.

---

## Optional, not built

- **Calendar sync.** Availability is *published* availability — the hours
  Michael is willing to work. It does not know what is already in his Google
  Calendar. Syncing so a dentist appointment blocks a slot is separate work.
- **PWA and push notifications.** Explicitly out of scope for v1.
- The old Typeform booking form lives at
  `https://form.typeform.com/to/BumCiBtG`. Retired, noted here only as a
  fallback if something goes wrong on launch day.
