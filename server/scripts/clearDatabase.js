import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import { User } from '../models/User.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { OfficerProfile } from '../models/OfficerProfile.js';
import { ShopkeeperProfile } from '../models/ShopkeeperProfile.js';
import { Land } from '../models/Land.js';
import { CropRegistration } from '../models/CropRegistration.js';
import { CropRegistrationHistory } from '../models/CropRegistrationHistory.js';
import { Shop } from '../models/Shop.js';
import { Product } from '../models/Product.js';
import { ShopInventory } from '../models/ShopInventory.js';
import { Review } from '../models/Review.js';
import { GovernmentUpdate } from '../models/GovernmentUpdate.js';
import { RegistrationDeadline } from '../models/RegistrationDeadline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const clearDatabase = async () => {
  try {
    const mongoUri = (process.env.MONGODB_URI || '').trim();
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in server/.env');
      process.exit(1);
    }

    console.log(`📡 Connecting to MongoDB Atlas: ${mongoUri.split('@')[1] || 'Cluster'}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      family: 4,
      dbName: process.env.MONGODB_DB_NAME || 'agri_project_sepm'
    });

    console.log('🗑️  Deleting all records from all collections in MongoDB Atlas...');

    const results = await Promise.all([
      User.deleteMany({}),
      FarmerProfile.deleteMany({}),
      OfficerProfile.deleteMany({}),
      ShopkeeperProfile.deleteMany({}),
      Land.deleteMany({}),
      CropRegistration.deleteMany({}),
      CropRegistrationHistory.deleteMany({}),
      Shop.deleteMany({}),
      Product.deleteMany({}),
      ShopInventory.deleteMany({}),
      Review.deleteMany({}),
      GovernmentUpdate.deleteMany({}),
      RegistrationDeadline.deleteMany({}),
    ]);

    console.log('✅ MongoDB Atlas database successfully emptied:');
    console.log(` - Users deleted: ${results[0].deletedCount}`);
    console.log(` - Farmer Profiles deleted: ${results[1].deletedCount}`);
    console.log(` - Officer Profiles deleted: ${results[2].deletedCount}`);
    console.log(` - Shopkeeper Profiles deleted: ${results[3].deletedCount}`);
    console.log(` - Land Parcels deleted: ${results[4].deletedCount}`);
    console.log(` - Crop Registrations deleted: ${results[5].deletedCount}`);
    console.log(` - Crop Histories deleted: ${results[6].deletedCount}`);
    console.log(` - Shops deleted: ${results[7].deletedCount}`);
    console.log(` - Products deleted: ${results[8].deletedCount}`);
    console.log(` - Inventory deleted: ${results[9].deletedCount}`);
    console.log(` - Reviews deleted: ${results[10].deletedCount}`);
    console.log(` - Govt Updates deleted: ${results[11].deletedCount}`);
    console.log(` - Deadlines deleted: ${results[12].deletedCount}`);

    console.log('\n🌟 Clean slate ready! All data in MongoDB Atlas has been cleared.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing MongoDB Atlas database:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

clearDatabase();
