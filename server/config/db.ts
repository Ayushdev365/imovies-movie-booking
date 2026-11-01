/**
 * Database Connection & In-Memory Fallback Engine
 * Connects to MongoDB via Mongoose if MONGODB_URI is provided.
 * If MONGODB_URI is empty or inaccessible, falls back to a high-fidelity
 * in-memory document store ensuring zero disruption in the developer environment.
 */
import mongoose from 'mongoose';

export let isConnectedToMongoDB = false;
export let dbStatusMessage = 'Initializing database...';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    isConnectedToMongoDB = false;
    dbStatusMessage = 'Operating in High-Performance Local In-Memory Storage (Set MONGODB_URI in .env for Atlas)';
    console.log(`[Database] ${dbStatusMessage}`);
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnectedToMongoDB = true;
    dbStatusMessage = `Connected to MongoDB Atlas (${mongoose.connection.host})`;
    console.log(`[Database] ${dbStatusMessage}`);
  } catch (err: any) {
    isConnectedToMongoDB = false;
    dbStatusMessage = `MongoDB connection attempt failed (${err.message}). Using resilient In-Memory store.`;
    console.warn(`[Database] ${dbStatusMessage}`);
  }
}
