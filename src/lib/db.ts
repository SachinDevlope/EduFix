import mongoose from 'mongoose';
import { env } from './env';

/**
 * MongoDB connection helper.
 *
 * - If MONGODB_URI is set, connects to that (e.g. MongoDB Atlas).
 * - Otherwise spins up an in-process in-memory MongoDB so the app runs
 *   with zero configuration (great for demos), and auto-seeds it once.
 *
 * The connection (and the in-memory server) are cached on `globalThis`
 * so Next.js hot-reloads in dev don't open a new connection each time.
 */

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServer: unknown | null;
  seeded: boolean;
};

const globalForMongoose = globalThis as unknown as { __edufixMongoose?: Cache };

const cache: Cache =
  globalForMongoose.__edufixMongoose ??
  (globalForMongoose.__edufixMongoose = {
    conn: null,
    promise: null,
    memoryServer: null,
    seeded: false,
  });

async function resolveUri(): Promise<string> {
  if (env.mongoUri) return env.mongoUri;

  // Lazy-load so the in-memory dependency is only required when needed.
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  if (!cache.memoryServer) {
    cache.memoryServer = await MongoMemoryServer.create({
      instance: { dbName: 'edufix' },
    });
    // eslint-disable-next-line no-console
    console.log('🧪 Using in-memory MongoDB (no MONGODB_URI set).');
  }
  return (cache.memoryServer as { getUri: () => string }).getUri();
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    mongoose.set('strictQuery', true);
    cache.promise = resolveUri().then((uri) =>
      mongoose.connect(uri, {
        dbName: 'edufix',
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      }),
    );
  }

  cache.conn = await cache.promise;

  // Auto-seed once per process when running against the in-memory DB.
  if (!cache.seeded && env.autoSeed && !env.mongoUri) {
    cache.seeded = true;
    try {
      const { seedDatabase } = await import('./seed-data');
      const result = await seedDatabase({ silent: true, onlyIfEmpty: true });
      if (result.seeded) {
        // eslint-disable-next-line no-console
        console.log(
          `🌱 Auto-seeded demo data: ${result.users} users, ${result.issues} issues.`,
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Auto-seed failed:', err);
    }
  }

  return cache.conn;
}

export default connectDB;
