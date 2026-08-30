import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const landSchema = new mongoose.Schema({}, { strict: false });
const Land = mongoose.model('Land', landSchema, 'lands');

const cropSchema = new mongoose.Schema({}, { strict: false });
const CropRegistration = mongoose.model('CropRegistration', cropSchema, 'cropregistrations');

const farmerSchema = new mongoose.Schema({}, { strict: false });
const FarmerProfile = mongoose.model('FarmerProfile', farmerSchema, 'farmerprofiles');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const lands = await Land.find({ overallVerificationStatus: 'VERIFIED' }).populate({
    path: 'farmerId',
    populate: { path: 'userId' }
  });

  console.log(`Found ${lands.length} verified lands:`);
  for (const l of lands) {
    console.log({
      landId: l.landId,
      survey: l.surveyNumber,
      farmerProfileId: l.farmerId?._id,
      farmerCode: l.farmerId?.farmerId,
      farmerName: l.farmerId?.userId?.name,
      farmerPhone: l.farmerId?.userId?.phone,
      farmerEmail: l.farmerId?.userId?.email
    });
    const crops = await CropRegistration.find({
      $or: [{ landId: l._id }, { farmerId: l.farmerId?._id, surveyNumber: l.surveyNumber }]
    });
    console.log('Crops:', crops.map(c => ({ name: c.cropName, area: c.cultivatedArea, regId: c.registrationId, status: c.status })));
  }

  await mongoose.disconnect();
}

main().catch(console.error);
