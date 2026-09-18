import { MongoClient } from 'mongodb';

/* The client promise is cached on globalThis so warm Lambda invocations reuse
   the connection. Without this every request opens a new pool and Atlas starts
   refusing connections under any real traffic. */
const uri = process.env.MONGODB_URI;

let cached = globalThis.__ppMongo;
if (!cached) cached = globalThis.__ppMongo = { promise: null, indexes: null };

export async function db() {
  if (!uri) throw new Error('MONGODB_URI is not set');
  if (!cached.promise) {
    cached.promise = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
    }).connect();
  }
  const client = await cached.promise;
  /* Database name comes from the URI path, so it is configured in one place. */
  const database = client.db();

  /* Index creation is idempotent and runs once per warm container, not once
     per request. It is awaited on the first call so the first query already
     benefits, and a failure here must not take the request down — a missing
     index is slow, not broken. */
  if (!cached.indexes) {
    cached.indexes = ensureIndexes(database).catch((err) => {
      cached.indexes = null;
      console.error('[mongo] index creation failed:', err?.message || err);
    });
  }
  await cached.indexes;

  return database;
}

/* ---------------------------------------------------------------------------
   Indexes.
   ---------------------------------------------------------------------------
   bookings.ref and invoices.number are unique because both are human-facing
   identifiers that get read down a phone. A duplicate is worse than a failed
   write, so the database refuses it rather than trusting the generator.
   --------------------------------------------------------------------------- */
async function ensureIndexes(database) {
  await Promise.all([
    database.collection('bookings').createIndexes([
      { key: { createdAt: -1 }, name: 'createdAt_desc' },
      { key: { status: 1 }, name: 'status' },
      { key: { read: 1 }, name: 'read' },
      { key: { scheduledAt: 1 }, name: 'scheduledAt' },
      { key: { ref: 1 }, name: 'ref_unique', unique: true },
    ]),
    database.collection('invoices').createIndexes([
      { key: { issuedAt: -1 }, name: 'issuedAt_desc' },
      { key: { bookingId: 1 }, name: 'bookingId' },
      { key: { number: 1 }, name: 'number_unique', unique: true },
    ]),
    database.collection('siteContent').createIndexes([
      { key: { section: 1 }, name: 'section_unique', unique: true },
    ]),
    database.collection('publishHistory').createIndexes([
      { key: { publishedAt: -1 }, name: 'publishedAt_desc' },
    ]),
  ]);
}

export const bookings = async () => (await db()).collection('bookings');
export const invoices = async () => (await db()).collection('invoices');
export const siteContent = async () => (await db()).collection('siteContent');
export const publishHistory = async () => (await db()).collection('publishHistory');
export const counters = async () => (await db()).collection('counters');

/* ---------------------------------------------------------------------------
   Atomic sequence.
   ---------------------------------------------------------------------------
   Replaces countDocuments() for generating invoice numbers. Two invoices
   created in the same millisecond used to get the same number; findOneAndUpdate
   with $inc is a single atomic document operation, so they cannot.
   --------------------------------------------------------------------------- */
export async function nextSequence(name) {
  const col = await counters();
  const res = await col.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  /* Driver 6 returns the document directly; older shapes wrap it in .value. */
  const doc = res?.value || res;
  return doc?.seq ?? 1;
}
