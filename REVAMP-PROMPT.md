# Website Revamp Prompt — Paps Productions

Copy everything below the line into a new Claude Code (or other AI coding assistant) session opened on this repository. Fill in the `[BRACKETED]` placeholders first.

---

## Role & Context

You are a senior full-stack web developer and designer. Completely revamp this repository — the website for **Paps Productions**, a cinematic automotive photography business — from a basic static site into an advanced, professional photography portfolio platform with real booking, an interactive service-area map, an upcoming events section, and a private admin dashboard for the site owner.

**Current state of the repo (replace all of it, but preserve brand content):**
- Static HTML/CSS/JS: `index.html`, `booking.html`, `terms.html`, shared header/footer fetched from `Backend/*.html`, styles in `Styles/`, scripts in `Java/main.js`, images and logos in `Storage/`.
- Hosted on **Vercel** (`vercel.json` has rewrites for `/booking` and `/terms`).
- Booking is currently an embedded Typeform popup (`https://form.typeform.com/to/BumCiBtG`) — replace it with a native booking system.
- Portfolio currently links out to Adobe Portfolio pages — replace with self-hosted galleries.
- Existing brand content to carry over: the FAQ answers on `index.html`, the four pricing packages on `booking.html` (1 Hour Photo Session $50 — most popular; 2 Hour Photo Session $80; 30 Min Roller Session $45; 1 Hour Roller Session $90), the Terms & Conditions page, the Instagram link (`@paps_productions`), and the logos/photos in `Storage/`.

## Tech Stack

- **Next.js (App Router) + TypeScript**, deployed on Vercel. Migrate the static pages into this app; keep the `/`, `/booking`, `/terms` URLs working.
- **Database:** [Vercel Postgres / Supabase / other — pick one and set it up] for bookings, events, gallery metadata, and analytics.
- **Map:** Leaflet with OpenStreetMap tiles (free, no API key). Do not use Google Maps unless I provide an API key.
- **Email notifications:** [Resend / other] to notify `[OWNER EMAIL]` on new bookings.
- **Auth for admin:** simple, robust credential login (e.g., NextAuth credentials provider or signed-cookie session) with a hashed password stored in an environment variable — no public sign-up.
- Styling: Tailwind CSS (or well-organized CSS modules). Keep Lucide icons.
- Everything must work on Vercel's free tier and require no server maintenance.

## Design Direction

- Dark, cinematic, editorial aesthetic that puts photography first: near-black backgrounds, high-contrast type, generous whitespace, subtle grain/vignette accents.
- Full-bleed hero imagery, smooth scroll-triggered reveals, tasteful parallax. No cheesy stock effects.
- Fully responsive and polished on mobile — most clients arrive from Instagram.
- Fast: optimized images (`next/image`), lazy loading, Lighthouse 90+ on performance, accessibility, and SEO.
- Accessible: semantic HTML, keyboard navigation, focus states, alt text, reduced-motion support.

## Public Site — Pages & Features

### 1. Home (`/`)
- Fullscreen cinematic hero with featured shot, brand name, tagline, and CTAs ("View Portfolio", "Book a Shoot").
- Featured work strip pulling the best gallery images.
- Teasers for Upcoming Events and the service-area map, each linking to their sections/pages.
- Keep the existing FAQ content in an accessible accordion.
- Footer with Instagram, booking link, terms link.

### 2. Portfolio (`/portfolio`)
- Self-hosted, filterable gallery (categories e.g. Automotive, Rollers/Video, Portraits, Events; filter chips, not dropdowns).
- Masonry or justified grid, blur-up placeholders, infinite scroll or "load more".
- Full-screen lightbox with keyboard/swipe navigation and shoot metadata (title, date, location).
- Gallery data comes from the database so the admin can add/remove shoots and images without code changes. Seed it with the existing photos in `Storage/Photos` and the three shoot titles currently on the home page.

### 3. Booking (`/booking`)
- Keep and restyle the four pricing packages as selectable cards.
- Native multi-step booking flow: choose package → pick preferred date/time (disable past dates; [list any blackout days/hours]) → details form (name, email, phone, car(s) make/model, preferred location/area, Instagram handle, notes) → review & submit.
- On submit: save to the database with status `new`, email the owner, show a confirmation screen explaining that every booking starts with a consultation and the owner will confirm within [X hours].
- Client- and server-side validation, honeypot + rate limiting for spam, link to Terms & Conditions.

### 4. Interactive Service-Area Map (section on `/booking` and/or its own `/area` page)
- Leaflet map centered on **[CITY, STATE]**, with a styled dark map theme to match the site.
- A shaded polygon or radius circle showing the service area: **[describe area, e.g. "40-mile radius around CITY" or list of towns]**.
- Custom-branded markers for favorite shoot locations: **[list 3–8 spots with names + short blurbs]**, each with a popup (photo optional).
- A note for travel outside the area: **[travel fee policy or "contact me"]**.

### 5. Upcoming Events (`/events` + home-page teaser)
- Cards for car meets, shows, and open shoot days: title, date/time, location, cover image, description, optional external link, and a "Book me for this event" CTA that pre-fills the booking form.
- Events live in the database and are managed from the admin panel. Past events automatically move to a collapsed "Past events" list.
- Empty state ("No upcoming events — follow @paps_productions for announcements") when there are none.

### 6. Terms (`/terms`)
- Migrate existing content into the new design.

## Admin Dashboard (`/admin`)

Private, login-protected area for the site owner:

- **Login:** single owner account; credentials via environment variables; session expires; no public registration; `/admin/*` blocked from search indexing and protected by middleware.
- **Overview / statistics:** total bookings (all-time, this month), bookings by status, revenue estimate by package, most-requested package, page-view counts and top pages (integrate Vercel Analytics or a lightweight self-hosted counter), booking-conversion trend chart over time.
- **Booking inbox:** list all booking submissions newest-first with status badges (`new` / `contacted` / `confirmed` / `completed` / `declined`); unread indicator for new ones; detail view showing every field the client submitted; one-click status updates; "reply by email" mailto shortcut; search and filter by status/package/date.
- **Events manager:** create, edit, publish/unpublish, and delete events (with image upload or image URL).
- **Gallery manager:** create shoots/albums, upload or reference images, set category, cover image, and ordering.
- Mobile-friendly — the owner will check bookings from a phone.

## Deliverables & Quality Bar

1. Complete, working Next.js app replacing the current site, with all pages above.
2. Database schema/migrations plus seed data (existing packages, photos, one sample event).
3. `.env.example` documenting every required environment variable, and a `README.md` covering local dev, database setup, and Vercel deployment (including how the owner logs into `/admin` and changes the password).
4. Old `/`, `/booking`, `/terms` URLs keep working; update `vercel.json`/routing accordingly.
5. No console errors; forms fully validated; build passes (`next build`) before you finish.
6. Commit in logical steps with clear messages.

Work through this in order: project scaffold & migration of existing content → portfolio → booking + database + email → map → events → admin dashboard → polish, SEO, and performance pass. Ask me for the bracketed details before building the map and email pieces if I haven't provided them.

---

## Placeholders to fill in before using

- `[OWNER EMAIL]` — where booking notifications go
- `[CITY, STATE]` — map center
- Service-area definition (radius or town list)
- 3–8 favorite shoot locations for map markers
- Travel-fee policy
- Booking confirmation window (e.g. "within 24 hours")
- Any blackout dates/hours for booking
- Database and email provider choices if you have preferences
