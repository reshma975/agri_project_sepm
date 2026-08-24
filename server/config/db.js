import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  let mongoUri = (process.env.MONGODB_URI || '').trim();

  // If a MongoDB URI is specified, try connecting to it first
  if (mongoUri) {
    try {
      console.log(`📡 Attempting connection to MongoDB (${mongoUri.includes('@') ? 'Remote Atlas' : 'Local URI'})...`);
      const options = {
        serverSelectionTimeoutMS: 5000,
      };
      if (process.env.MONGODB_DB_NAME) {
        options.dbName = process.env.MONGODB_DB_NAME;
      }
      const conn = await mongoose.connect(mongoUri, options);
      console.log(`🌾 MongoDB Connected Successfully: ${conn.connection.host} (Database: ${conn.connection.name})`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ Could not connect to configured MongoDB (${err.message}).`);
      console.log('🌱 Falling back to built-in in-memory MongoDB engine...');
    }
  } else {
    console.log('🌱 No external MONGODB_URI provided. Initializing in-memory MongoDB engine...');
  }

  // Fallback to in-memory MongoMemoryServer
  try {
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'farmsetu_db'
      }
    });
    const inMemoryUri = mongod.getUri();
    const conn = await mongoose.connect(inMemoryUri);
    console.log(`🌾 In-Memory MongoDB Connected & Ready: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
};
