import mongoose from 'mongoose';
import { env } from '../src/config/env.js';

beforeAll(async () => {
  // Use a dedicated test database
  const testDbUri = env.MONGODB_URI.includes('_test')
    ? env.MONGODB_URI
    : `${env.MONGODB_URI}_test`;
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testDbUri);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});
