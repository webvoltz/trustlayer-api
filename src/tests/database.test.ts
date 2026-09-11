import mongoose from 'mongoose';
import { afterEach, describe, expect, it } from 'vitest';

import { connectDatabase, disconnectDatabase } from '../config/database.js';

describe('database connection helpers', () => {
  afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connect(process.env['MONGODB_URI'] ?? '');
    }
  });

  it('connects to and disconnects from MongoDB', async () => {
    await disconnectDatabase();
    expect(mongoose.connection.readyState).toBe(0);

    await connectDatabase();
    expect(mongoose.connection.readyState).toBe(1);
  });
});
