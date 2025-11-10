import mongoose from "mongoose";

let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;

export const connectDB = async () => {
  if (isConnected) {
    console.log('✅ MongoDB is already connected');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,    // 30 second timeout
      socketTimeoutMS: 45000,            // 45 second socket timeout
      maxPoolSize: 50,                   // Increased for production
      minPoolSize: 10,                   // Minimum connections
      maxIdleTimeMS: 30000,              // Close idle connections after 30s
    });

    isConnected = true;
    connectionRetries = 0;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

  } catch (error) {
    connectionRetries++;
    
    if (connectionRetries <= MAX_RETRIES) {
      console.log(`🔄 Retrying connection (${connectionRetries}/${MAX_RETRIES})...`);
      setTimeout(connectDB, 2000 * connectionRetries); // Exponential backoff
      return;
    }

    console.error('❌ MongoDB connection failed after retries:', error.message);
    process.exit(1);
  }
};

// Auto-reconnect on connection loss
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('⚠️ MongoDB disconnected - attempting reconnect...');
  setTimeout(connectDB, 2000);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});