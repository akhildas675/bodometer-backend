import mongoose from "mongoose";

export async function connectDB(mongoUri: string) {
  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 50, // Maximum number of connections in the pool
      minPoolSize: 5,  // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
      connectTimeoutMS: 10000, // Connection timeout
    });
    console.log('Mongoose Connected!');
  } catch (error: unknown) {
    console.error("MongoDB connection error:", error);
  }
}