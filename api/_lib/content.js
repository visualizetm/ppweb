import { siteContent } from './mongo.js';
import {
  SECTIONS,
  SECTION_IDS,
  DEFAULTS,
  sanitizeSection,
  withDefaults,
} from '../../shared/content-schema.js';
import { GALLERY_SEED } from '../../shared/gallery-seed.js';
import { FAQ_SEED } from '../../shared/faq-seed.js';

/* ===========================================================================
   Content store.
   ---------------------------------------------------------------------------
   One document per section: { section, draft, published, updatedAt, publishedAt }

   Draft and published are separate copies, never references. The public site
   reads `published` and nothing else, so an admin can leave a half finished
   edit sitting in `draft` indefinitely without it appearing anywhere.
   =========================================================================== */

/** The starting state for a section that has never been saved. Both sides get
    the same defaults, so a brand new install is "nothing to publish" rather
    than "everything changed". */
function seedFor(sectionId) {
  if (sectionId === 'galleries') return sanitizeSection('galleries', { items: GALLERY_SEED });
  if (sectionId === 'faq') return sanitizeSection('faq', { items: FAQ_SEED });
  return sanitizeSection(sectionId, DEFAULTS[sectionId]);
}

/** Reads every section, creating any that do not exist yet. Idempotent, and
    safe to call on every request: the upsert only writes on first boot. */
export async function readAllSections() {
  const col = await siteContent();
  const rows = await col.find({ section: { $in: SECTION_IDS } }).toArray();
  const bySection = new Map(rows.map((r) => [r.section, r]));

  const missing = SECTION_IDS.filter((id) => !bySection.has(id));
  if (missing.length) {
    const now = new Date();
    const docs = missing.map((id) => {
      const seed = seedFor(id);
      return {
        section: id,
        draft: seed,
        published: seed,
        updatedAt: now,
        publishedAt: now,
      };
    });
    /* Unique index on `section` means a concurrent cold start cannot create
       duplicates; it just loses the race, which is fine. */
    try {
      await col.insertMany(docs, { ordered: false });
    } catch {
      /* Duplicate key from a parallel cold start. Re-read below. */
    }
    const refetched = await col.find({ section: { $in: missing } }).toArray();
    refetched.forEach((r) => bySection.set(r.section, r));
  }

  return SECTION_IDS.map((id) => {
    const row = bySection.get(id) || {};
    return {
      section: id,
      draft: withDefaults(id, row.draft),
      published: withDefaults(id, row.published),
      updatedAt: row.updatedAt || null,
      publishedAt: row.publishedAt || null,
    };
  });
}

/** What the public site renders: published values only, keyed by section. */
export async function readPublished() {
  const all = await readAllSections();
  const out = {};
  all.forEach((row) => {
    out[row.section] = row.published;
  });
  return out;
}

/** Writes a draft. Returns the stored (sanitised) value so the admin form
    shows exactly what the database now holds rather than what it sent. */
export async function writeDraft(sectionId, value) {
  if (!SECTION_IDS.includes(sectionId)) return null;
  const clean = sanitizeSection(sectionId, value);
  const col = await siteContent();

  await col.updateOne(
    { section: sectionId },
    {
      $set: { draft: clean, updatedAt: new Date() },
      $setOnInsert: { section: sectionId, published: seedFor(sectionId), publishedAt: new Date() },
    },
    { upsert: true }
  );

  return clean;
}

/** Throws away an unpublished draft by copying published back over it. */
export async function revertDraft(sectionId) {
  if (!SECTION_IDS.includes(sectionId)) return null;
  const col = await siteContent();
  const row = await col.findOne({ section: sectionId });
  if (!row) return null;

  await col.updateOne(
    { section: sectionId },
    { $set: { draft: row.published, updatedAt: new Date() } }
  );
  return withDefaults(sectionId, row.published);
}

export { SECTIONS, SECTION_IDS };
