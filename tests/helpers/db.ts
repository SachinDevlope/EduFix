import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mem: MongoMemoryServer | null = null;

export async function connectTestDB() {
  mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri(), { dbName: 'edufix_test' });
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

export async function closeTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mem) await mem.stop();
}
