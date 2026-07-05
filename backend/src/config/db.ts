import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { isMongoConfigured } from '../models/dbAdapter';

dotenv.config();

export async function connectDB() {
  if (isMongoConfigured()) {
    try {
      await mongoose.connect(process.env.MONGO_URI!);
      console.log('MongoDB connected successfully!');
    } catch (error) {
      console.error('MongoDB connection failed. Falling back to local file database.', error);
    }
  } else {
    console.log('--- MONGO_URI is not set. CivicForge is running with the LOCAL JSON PERSISTENT DATABASE FALLBACK ---');
    console.log('All data will be saved securely in the workspace inside "local_database.json"');
  }
}
