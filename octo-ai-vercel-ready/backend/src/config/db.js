import mongoose from 'mongoose';
import config from './env.js';

let isConnected = false;
let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }
  if (!config.mongoUri) {
    console.log('ℹ️  MongoDB URI not configured. Running in Zero-Cost Local Persistence Mode.');
    isConnected = false;
    return false;
  }

  // Check if user forgot to replace the placeholder
  if (config.mongoUri.includes('<db_password>') || config.mongoUri.includes('<password>')) {
    console.warn('⚠️  Notice: Your MONGODB_URI in backend/.env contains "<db_password>".');
    console.warn('👉 Please replace "<db_password>" with your real MongoDB Atlas database user password.');
  }

  if (connectionPromise) return connectionPromise;
  connectionPromise = (async () => {
  try {
    const isAtlas = config.mongoUri.includes('mongodb+srv://');
    console.log(`🔄 Attempting MongoDB connection (${isAtlas ? 'MongoDB Atlas Cloud' : 'Local MongoDB'})...`);

    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 8000 // Give Atlas sufficient time for DNS SRV & TLS
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`⚠️  MongoDB connection failed: ${err.message}`);
    return false;
  }
  })();
  try {
    return await connectionPromise;
  } finally {
    connectionPromise = null;
  }
};

export const isMongoConnected = () => isConnected;

export const getDbStatus = () => ({
  connected: isConnected,
  type: isConnected ? 'MongoDB' : 'Local File Persistence (Zero-Cost)',
  host: isConnected ? mongoose.connection?.host : 'Local JSON Store'
});

export default { connectDB, isMongoConnected, getDbStatus };
