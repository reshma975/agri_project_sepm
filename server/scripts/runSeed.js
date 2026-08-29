import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import { seedDatabase } from '../seed/seedDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    console.log('📡 Connecting to MongoDB Atlas for initial seeding...');
    await connectDB();
    console.log('🌱 Starting database seeding process...');
    await seedDatabase(true);
    console.log('✨ Seeding finished successfully!');
    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    await closeDB();
    process.exit(1);
  }
};

run();
