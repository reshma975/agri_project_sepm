import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.trim() === '') {
      console.log('🌱 No external MONGODB_URI provided. Initializing in-memory MongoDB engine...');
      mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'farmsetu_db'
        }
      });
      mongoUri = mongod.getUri();
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`🌾 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
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
