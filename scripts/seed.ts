/**
 * CLI seed runner: `npm run seed`
 *
 * Seeds the configured database (MONGODB_URI) with demo data:
 * 20 users, 10 staff, and 50 issues plus activity logs & notifications.
 *
 * NOTE: When MONGODB_URI is empty, the app uses an ephemeral in-memory DB
 * that only lives inside the running `next dev` process and auto-seeds itself.
 * This standalone script is most useful when pointing at a persistent
 * MongoDB (local or Atlas) via MONGODB_URI.
 */
import { config as loadEnv } from 'dotenv';
import mongoose from 'mongoose';
import { seedDatabase } from '../src/lib/seed-data';

// Load env in Next.js precedence (.env.local overrides .env).
loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

async function main() {
  if (!process.env.MONGODB_URI) {
    console.warn(
      '\n⚠️  MONGODB_URI is not set. This CLI seed uses a temporary in-memory DB that ' +
        'will NOT be shared with `npm run dev`.\n' +
        '    For a persistent demo, set MONGODB_URI (local MongoDB or Atlas) in .env.local.\n' +
        '    Otherwise, just run `npm run dev` — it auto-seeds its in-memory DB on startup.\n',
    );
  }
  await seedDatabase({ silent: false, onlyIfEmpty: false });
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
