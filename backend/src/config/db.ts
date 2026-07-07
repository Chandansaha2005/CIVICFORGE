import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    const errorMsg = 'CRITICAL CONFIG ERROR: MONGO_URI environment variable is missing. Database connection is required.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('CRITICAL ERROR: MongoDB connection failed. Server cannot start.', error);
    throw error;
  }
}
