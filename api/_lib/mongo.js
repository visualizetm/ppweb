import { MongoClient } from 'mongodb';

/* The client promise is cached on globalThis so warm Lambda invocations reuse
   the connection. Without this every request opens a new pool and Atlas starts
   refusing connections under any real traffic. */
const uri = process.env.MONGODB_URI;

let cached = globalThis.__ppMongo;
if (!cached) cached = globalThis.__ppMongo = { promise: null };

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
  return client.db();
}

export const bookings = async () => (await db()).collection('bookings');
export const invoices = async () => (await db()).collection('invoices');
