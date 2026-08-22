import mongoose from 'mongoose';

/**
 * MongoDB Database Connection Manager
 * Handles robust connection lifecycle, reconnection events, and logging.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rakthalink';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if server is unavailable
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn(`⚠️ Running with disconnected database state. Ensure MongoDB is running locally or set MONGODB_URI in server/.env`);
    return null;
  }
};

// Listen to Mongoose connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection lost. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🍃 MongoDB successfully reconnected.');
});

export default connectDB;
