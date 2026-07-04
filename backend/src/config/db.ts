import mongoose from 'mongoose';
import { isMongoConfigured } from '../models/dbAdapter';

export async function connectDB() {
  if (isMongoConfigured()) {
    try {
      console.log('Connecting to MongoDB Atlas at:', process.env.MONGO_URI);
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
