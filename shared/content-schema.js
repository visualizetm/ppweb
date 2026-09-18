/* ===========================================================================
   Site content schema.
   ---------------------------------------------------------------------------
   The single definition of everything Michael can edit without a developer.
   Imported by BOTH the browser (to render the admin forms and to fall back to
   sensible copy before the API answers) and the serverless functions (to
   sanitise what gets written to Mongo). One definition, so a field cannot
   exist in the form and not in the sanitiser.

   ADDING A NEW EDITABLE FIELD IS A DATA CHANGE, NOT A CODE CHANGE.
   Add it to the right section's `fields` array, give it a default in
   DEFAULTS, and read it on the page with useContent(). The admin form, the
   draft/publish plumbing, the change summary and the sanitiser all pick it up
   automatically.

   Field types:
     text      single line
     textarea  multi line, one block of prose
     prose     multi line, blank-line separated -> array of paragraphs
     url       text, validated loosely as a link or path
     image     an uploaded image URL (Vercel Blob) or a local /path
     toggle    boolean
     select    one of `options`
     money     an integer number of CENTS, entered in the admin as dollars
     number    plain integer
     list      repeatable group of `fields`
     imagelist repeatable { url, alt } pairs with upload + reorder
   =========================================================================== */

/* --- helpers used by the section definitions ---------------------------- */
const t = (key, label, extra = {}) => ({ key, label, type: 'text', max: 200, ...extra });
const ta = (key, label, extra = {}) => ({ key, label, type: 'textarea', max: 1200, ...extra });

export const SECTIONS = [
  /* ===================================================== announcement === */
  {
    id: 'announcement',
    label: 'Announcement bar',
    blurb:
      'A single line across the very top of every page. Off unless you turn it on and publish it.',
    fields: [
      {
        key: 'enabled',
        label: 'Show the announcement bar',
        type: 'toggle',
        help: 'Off hides it everywhere, whatever the message says.',
      },
      t('message', 'Message', {
        max: 160,
        help: 'Keep it to one line. Long messages wrap and push the page down on phones.',
        placeholder: 'Booking now for spring. Limited golden hour slots.',
      }),
      t('linkText', 'Link text', {
        max: 40,
        help: 'Leave blank for a message with no link.',
        placeholder: 'Book a shoot',
      }),
      {
        key: 'linkUrl',
        label: 'Link goes to',
        type: 'url',
        max: 300,
        placeholder: '/booking',
        help: 'A path on this site such as /booking, or a full https:// address.',
      },
      {
        key: 'tone',
        label: 'Style',
        type: 'select',
        options: [
          { value: 'accent', label: 'Accent (brand blue)' },
          { value: 'neutral', label: 'Neutral (quiet grey)' },
          { value: 'alert', label: 'Alert (high contrast)' },
        ],
        help: 'Three options drawn from the site palette, so the bar cannot clash.',
      },
    ],
  },

  /* ============================================================= hero === */
  {
    id: 'hero',
    label: 'Home page hero',
    blurb: 'The first screen. Headline, supporting line, both buttons, and the photograph.',
    fields: [
      ta('title', 'Headline', {
        max: 90,
        rows: 2,
        help: 'A line break in this box becomes a line break on the page.',
      }),
      ta('subtitle', 'Supporting paragraph', { max: 500, rows: 4 }),
      t('primaryCtaLabel', 'Main button text', { max: 40 }),
      { key: 'primaryCtaHref', label: 'Main button goes to', type: 'url', max: 300 },
      t('secondaryCtaLabel', 'Second button text', { max: 40 }),
      { key: 'secondaryCtaHref', label: 'Second button goes to', type: 'url', max: 300 },
      t('note', 'Small print under the buttons', { max: 200 }),
      { key: 'image', label: 'Hero photograph', type: 'image' },
      ta('imageAlt', 'Photograph description', {
        max: 300,
        rows: 3,
        help: 'Read aloud by screen readers and shown if the image fails to load. Describe what is actually in the frame.',
      }),
      t('lightPlace', 'Location shown on the light readout', { max: 60 }),
    ],
  },

  /* ===================================================== home sections === */
  {
    id: 'home',
    label: 'Home page sections',
    blurb: 'Every heading and paragraph below the hero, plus the four process steps.',
    fields: [
      t('featuredTitle', 'Recent work heading', { max: 80 }),
      ta('featuredSubtitle', 'Recent work subheading', { max: 300, rows: 2 }),

      t('howManyLabel', 'Photo count eyebrow', { max: 60 }),
      ta('howManyTitle', 'Photo count heading', { max: 160, rows: 2 }),

      t('servicesTitle', 'Services preview heading', { max: 80 }),
      ta('servicesSubtitle', 'Services preview subheading', { max: 300, rows: 2 }),

      t('processTitle', 'How it works heading', { max: 80 }),
      ta('processSubtitle', 'How it works subheading', { max: 300, rows: 2 }),
      {
        key: 'processSteps',
        label: 'Process steps',
        type: 'list',
        itemLabel: 'Step',
        max: 6,
        fields: [
          t('title', 'Step title', { max: 60 }),
          ta('desc', 'Step description', { max: 500, rows: 3 }),
        ],
      },

      t('testimonialsTitle', 'Testimonials heading', { max: 80 }),
      ta('testimonialsEmptyNote', 'Shown while there are no testimonials', { max: 300, rows: 2 }),

      t('ctaTitle', 'Closing banner heading', { max: 80 }),
      ta('ctaSubtitle', 'Closing banner paragraph', { max: 400, rows: 3 }),
      t('ctaButtonLabel', 'Closing banner button', { max: 40 }),
    ],
  },

  /* ======================================================== galleries === */
  {
    id: 'galleries',
    label: 'Galleries',
    blurb:
      'Every gallery on the site, in the order they appear. Upload covers and full image sets here.',
    editor: 'galleries',
    fields: [
      {
        key: 'items',
        label: 'Galleries',
        type: 'list',
        itemLabel: 'Gallery',
        max: 80,
        fields: [
          t('title', 'Title', { max: 80 }),
          t('slug', 'Web address', {
            max: 80,
            help: 'Appears in the link as /portfolio/your-slug. Lower case, dashes instead of spaces.',
          }),
          t('caption', 'Short caption', {
            max: 160,
            help: 'Shown on the card. Describe the shoot, not just the date.',
          }),
          t('dateLabel', 'Date shown', { max: 30, placeholder: '10/11/25' }),
          {
            key: 'type',
            label: 'Type',
            type: 'select',
            options: [
              { value: 'Solo', label: 'Solo' },
              { value: 'Duo', label: 'Duo' },
              { value: 'Group', label: 'Group' },
              { value: 'Event', label: 'Event' },
              { value: 'Portrait', label: 'Portrait' },
            ],
          },
          t('location', 'Location', { max: 120 }),
          ta('blurb', 'Description', { max: 1200, rows: 4 }),
          { key: 'cover', label: 'Cover photograph', type: 'image' },
          ta('coverAlt', 'Cover description', { max: 300, rows: 2 }),
          {
            key: 'featured',
            label: 'Feature on the home page',
            type: 'toggle',
            help: 'The home page shows the first three featured galleries.',
          },
          { key: 'images', label: 'Photographs', type: 'imagelist', max: 200 },
        ],
      },
    ],
  },

  /* ========================================================= services === */
  {
    id: 'services',
    label: 'Services and pricing',
    blurb: 'Every price on the services page, the deposit, travel and turnaround.',
    fields: [
      {
        key: 'placeholderNotice',
        label: 'Show the "placeholder pricing" notice',
        type: 'toggle',
        help: 'Turn this off once every price below is a real number you are happy to be held to.',
      },
      ta('placeholderNoticeText', 'Notice wording', { max: 400, rows: 3 }),
      {
        key: 'prices',
        label: 'Package prices',
        type: 'list',
        itemLabel: 'Price',
        max: 40,
        lockedKey: 'key',
        fields: [
          t('key', 'Package and tier', { max: 60, readOnly: true }),
          t('label', 'Shown as', { max: 80, readOnly: true }),
          {
            key: 'priceCents',
            label: 'Price',
            type: 'money',
            help: 'Leave blank for "quote only", which is what Weddings uses.',
          },
        ],
      },
      { key: 'depositCents', label: 'Deposit', type: 'money' },
      ta('travelText', 'Travel policy', { max: 400, rows: 2 }),
      ta('turnaroundText', 'Turnaround', { max: 400, rows: 2 }),
    ],
  },

  /* ========================================================== contact === */
  {
    id: 'contact',
    label: 'Contact details',
    blurb:
      'Your email, phone and social links. Nothing is shown publicly until the first toggle is on.',
    fields: [
      {
        key: 'published',
        label: 'Publish contact details on the site',
        type: 'toggle',
        help: 'Off shows a "get in touch through the booking form" state instead of an address.',
      },
      t('email', 'Email address', { max: 200 }),
      t('phone', 'Phone number as written', { max: 40, placeholder: '(610) 555 0123' }),
      t('phoneHref', 'Phone number as dialled', { max: 40, placeholder: 'tel:+16105550123' }),
      t('responseTime', 'Usual reply time', { max: 80, placeholder: 'within 24 hours' }),
      t('serviceArea', 'Service area', { max: 160 }),
      { key: 'instagramUrl', label: 'Instagram link', type: 'url', max: 300 },
      { key: 'facebookUrl', label: 'Facebook link', type: 'url', max: 300 },
    ],
  },

  /* ============================================================ about === */
  {
    id: 'about',
    label: 'About page',
    blurb: 'The headline, the story, and the photograph of you.',
    fields: [
      ta('title', 'Headline', { max: 120, rows: 2 }),
      t('standfirst', 'Opening line', { max: 300 }),
      {
        key: 'body',
        label: 'Story',
        type: 'prose',
        max: 6000,
        rows: 12,
        help: 'Leave a blank line between paragraphs. Each block becomes its own paragraph.',
      },
      { key: 'portrait', label: 'Photograph', type: 'image' },
      ta('portraitAlt', 'Photograph description', { max: 300, rows: 2 }),
    ],
  },

  /* ===================================================== testimonials === */
  {
    id: 'testimonials',
    label: 'Testimonials',
    blurb:
      'Real quotes from real clients only. While this is empty the home page shows a placeholder rather than anything invented.',
    fields: [
      {
        key: 'items',
        label: 'Testimonials',
        type: 'list',
        itemLabel: 'Testimonial',
        max: 24,
        fields: [
          ta('text', 'What they said', { max: 600, rows: 4 }),
          t('author', 'Who said it', { max: 80, placeholder: 'First name and last initial' }),
          t('detail', 'Context', { max: 120, placeholder: '2019 Porsche 911, Solo Shoot' }),
        ],
      },
    ],
  },

  /* ============================================================== faq === */
  {
    id: 'faq',
    label: 'FAQ',
    blurb: 'Questions and answers on the FAQ page.',
    fields: [
      {
        key: 'items',
        label: 'Questions',
        type: 'list',
        itemLabel: 'Question',
        max: 40,
        fields: [
          t('question', 'Question', { max: 200 }),
          {
            key: 'answer',
            label: 'Answer',
            type: 'prose',
            max: 4000,
            rows: 6,
            help: 'Blank line between paragraphs.',
          },
          t('category', 'Group', { max: 60, placeholder: 'The work' }),
          {
            key: 'homepage',
            label: 'Feature this answer on the home page',
            type: 'toggle',
            help: 'The first question with this on gets its own section on the home page. Turning it on for a second question has no effect.',
          },
        ],
      },
    ],
  },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);
export const getSection = (id) => SECTIONS.find((s) => s.id === id);

/* ===========================================================================
   Defaults.
   ---------------------------------------------------------------------------
   These are the exact words on the site today. They are the fallback when the
   database has nothing published yet and the seed for a brand new install, so
   a fresh deploy looks finished rather than empty.
   =========================================================================== */
export const DEFAULTS = {
  announcement: {
    enabled: false,
    message: '',
    linkText: '',
    linkUrl: '/booking',
    tone: 'accent',
  },

  hero: {
    title: 'The light is\nhalf the job',
    subtitle:
      'I photograph cars around Delaware County and out into Philadelphia, on streets, in garages, on back roads, at meets. Almost everything in the portfolio was shot inside the bracketed strip above, and picking the right hour is most of why the photos look the way they do.',
    primaryCtaLabel: 'Book a shoot',
    primaryCtaHref: '/booking',
    secondaryCtaLabel: 'See the work',
    secondaryCtaHref: '/portfolio',
    note: 'Booking starts with a conversation, not a card. Nothing is charged when you send it.',
    image: '/brand/hero',
    imageAlt:
      'A lowered silver-grey sports sedan on aftermarket wheels, shot from the rear three-quarter outside a modern building under flat winter light',
    lightPlace: 'Delaware County, PA',
  },

  home: {
    featuredTitle: 'Recent work',
    featuredSubtitle: 'Three from the last few months. Every shoot gets its own gallery.',
    howManyLabel: 'The question everyone asks',
    howManyTitle: 'How many photos do I get?',
    servicesTitle: 'What I shoot',
    servicesSubtitle: 'Automotive is the bulk of it, not the limit of it.',
    processTitle: 'How it works',
    processSubtitle: 'Four steps, and the first one is a conversation rather than a payment.',
    processSteps: [
      {
        title: 'We talk first',
        desc: 'Free consultation, no card. How many cars, how many people, where, and what you actually want out of it. Most bookings start here.',
      },
      {
        title: 'Pick the light',
        desc: 'We settle the date and time. Golden hour and the window either side of it are marked as recommended, because that is where most of the portfolio comes from.',
      },
      {
        title: 'The shoot',
        desc: 'On location, not in a studio. The booking lists a time, and if we are close to something good when it runs out, I keep going.',
      },
      {
        title: 'The edit',
        desc: 'Everything delivered is fully edited. That is a large part of why the photos look the way they do, and it is not an upsell.',
      },
    ],
    testimonialsTitle: 'What clients say',
    testimonialsEmptyNote:
      'This section is ready and waiting on real quotes. Nothing here is invented.',
    ctaTitle: 'Let’s talk about your car',
    ctaSubtitle:
      'Start with a free consultation. No card, no commitment, just a conversation about what the shoot should be.',
    ctaButtonLabel: 'Book a consultation',
  },

  /* Seeded from src/data/galleries at first boot by api/admin/content.js so the
     nine existing galleries arrive already populated rather than blank. */
  galleries: { items: [] },

  services: {
    placeholderNotice: true,
    placeholderNoticeText:
      'The figures marked below are stand-ins so the booking flow has something to work with. They are not confirmed prices. Every shoot is quoted after a conversation.',
    prices: [
      { key: 'solo:solo-essential', label: 'Solo Shoot, Essential', priceCents: 27500 },
      { key: 'solo:solo-extended', label: 'Solo Shoot, Extended', priceCents: 42500 },
      { key: 'duo:duo-essential', label: 'Duo Shoot, Essential', priceCents: 45000 },
      { key: 'duo:duo-extended', label: 'Duo Shoot, Extended', priceCents: 65000 },
      { key: 'group:group-standard', label: 'Group Shoot, Group Coverage', priceCents: 75000 },
      { key: 'event:event-standard', label: 'Event Coverage', priceCents: 60000 },
      { key: 'portrait:portrait-essential', label: 'Portraits, Essential', priceCents: 22500 },
      { key: 'portrait:portrait-extended', label: 'Portraits, Extended', priceCents: 37500 },
      { key: 'wedding:wedding-custom', label: 'Weddings, Custom Coverage', priceCents: null },
      { key: 'editing:editing-single', label: 'Editing, Single Image', priceCents: 3500 },
      { key: 'editing:editing-set', label: 'Editing, Set of 10', priceCents: 27500 },
    ],
    depositCents: 10000,
    travelText: '',
    turnaroundText: '',
  },

  contact: {
    published: false,
    email: '',
    phone: '',
    phoneHref: '',
    responseTime: 'within 24 hours',
    serviceArea: 'Delaware County and the wider Philadelphia area',
    instagramUrl: 'https://www.instagram.com/paps_productions/',
    facebookUrl: '',
  },

  about: {
    title: '',
    standfirst: '',
    body: [],
    portrait: '',
    portraitAlt: '',
  },

  testimonials: { items: [] },

  /* Seeded from src/data/faqs on first boot, same as galleries. */
  faq: { items: [] },
};

/* ===========================================================================
   Sanitising.
   ---------------------------------------------------------------------------
   THE SECURITY BOUNDARY. Everything written to siteContent goes through
   sanitizeSection first, which walks the schema rather than the payload. A key
   the schema does not define cannot reach the database, however the request is
   shaped, and every string is length-capped at its declared max.
   =========================================================================== */

const str = (v, max) => String(v ?? '').slice(0, max).trim();

/** Loose link check. Allows a site path or an http(s) URL, rejects javascript:
    and data: which are the two that turn a link field into an XSS vector. */
function safeUrl(v, max) {
  const s = str(v, max);
  if (!s) return '';
  if (s.startsWith('/') || s.startsWith('#')) return s;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^mailto:|^tel:/i.test(s)) return s;
  return '';
}

function sanitizeField(field, value) {
  switch (field.type) {
    case 'toggle':
      return Boolean(value);

    case 'select': {
      const allowed = (field.options || []).map((o) => o.value);
      return allowed.includes(value) ? value : allowed[0] ?? '';
    }

    case 'money': {
      if (value === null || value === '' || value === undefined) return null;
      const n = Math.round(Number(value));
      return Number.isFinite(n) && n >= 0 ? Math.min(n, 100000000) : null;
    }

    case 'number': {
      const n = Math.round(Number(value));
      return Number.isFinite(n) ? n : 0;
    }

    case 'url':
      return safeUrl(value, field.max || 300);

    case 'image':
      return safeUrl(value, 600);

    case 'prose': {
      /* Accepts either an array of paragraphs or one blank-line-separated
         block, and always stores an array. */
      const blocks = Array.isArray(value) ? value : String(value ?? '').split(/\n\s*\n/);
      return blocks
        .map((p) => str(p, field.max || 4000))
        .filter(Boolean)
        .slice(0, 60);
    }

    case 'imagelist': {
      const items = Array.isArray(value) ? value : [];
      return items
        .slice(0, field.max || 200)
        .map((img) => ({
          url: safeUrl(img?.url, 600),
          alt: str(img?.alt, 300),
          /* Cloudinary asset id, kept so a removed photograph can be destroyed
             in storage rather than left behind. Empty for committed images. */
          publicId: str(img?.publicId, 200),
        }))
        .filter((img) => img.url);
    }

    case 'list': {
      const items = Array.isArray(value) ? value : [];
      return items.slice(0, field.max || 50).map((item) => {
        const out = {};
        field.fields.forEach((f) => {
          out[f.key] = sanitizeField(f, item?.[f.key]);
        });
        return out;
      });
    }

    case 'textarea':
    case 'text':
    default:
      return str(value, field.max || 200);
  }
}

/** Walks the schema for `sectionId` and returns a clean object. Unknown keys
    are dropped; missing keys fall back to the default for that section. */
export function sanitizeSection(sectionId, value) {
  const section = getSection(sectionId);
  if (!section) return null;

  const defaults = DEFAULTS[sectionId] || {};
  const input = value && typeof value === 'object' ? value : {};
  const out = {};

  section.fields.forEach((field) => {
    const raw = field.key in input ? input[field.key] : defaults[field.key];
    out[field.key] = sanitizeField(field, raw);
  });

  return out;
}

/** Fills in any field the stored document is missing, so a schema addition
    never renders as undefined on a page. */
export function withDefaults(sectionId, value) {
  return { ...(DEFAULTS[sectionId] || {}), ...(value || {}) };
}

/* ===========================================================================
   Change summary.
   ---------------------------------------------------------------------------
   Drives both the "unpublished changes" indicator and the publish history
   entry. Deliberately a field-name list rather than a diff engine: Michael
   needs to know WHICH things changed, not see a character-level comparison.
   =========================================================================== */

const sameValue = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Returns the labels of every field that differs between draft and published. */
export function changedFields(sectionId, draft, published) {
  const section = getSection(sectionId);
  if (!section) return [];

  const d = withDefaults(sectionId, draft);
  const p = withDefaults(sectionId, published);

  return section.fields
    .filter((f) => !sameValue(d[f.key], p[f.key]))
    .map((f) => {
      /* A list says how it changed rather than just "changed", because
         "Galleries" on its own is useless in a history entry. */
      if (f.type === 'list' || f.type === 'imagelist') {
        const dn = Array.isArray(d[f.key]) ? d[f.key].length : 0;
        const pn = Array.isArray(p[f.key]) ? p[f.key].length : 0;
        if (dn !== pn) return `${f.label} (${pn} to ${dn})`;
        return `${f.label} (edited)`;
      }
      return f.label;
    });
}

export function sectionIsDirty(sectionId, draft, published) {
  return changedFields(sectionId, draft, published).length > 0;
}

/* ===========================================================================
   Image URLs inside a content value.
   ---------------------------------------------------------------------------
   Walks any section value and returns the set of Cloudinary delivery URLs it
   references, whatever key they sit under. Used in the dashboard to decide
   whether a removed image is still live (and so must not be destroyed yet),
   and at publish time to destroy assets nothing references any more.
   =========================================================================== */
export const CLOUDINARY_PREFIX = 'https://res.cloudinary.com/';

export function collectImageUrls(value, out = new Set()) {
  if (typeof value === 'string') {
    if (value.startsWith(CLOUDINARY_PREFIX)) out.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectImageUrls(v, out));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collectImageUrls(v, out));
  }
  return out;
}
