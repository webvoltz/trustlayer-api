import mongoose from 'mongoose';
import { afterAll, beforeAll } from 'vitest';

beforeAll(async () => {
  const uri = process.env['MONGODB_URI'];
  if (!uri) {
    throw new Error('MONGODB_URI was not set by globalSetup');
  }
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});
