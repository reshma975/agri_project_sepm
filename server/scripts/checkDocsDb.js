import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const farmerSchema = new mongoose.Schema({}, { strict: false });
const FarmerProfile = mongoose.model('FarmerProfile', farmerSchema, 'farmerprofiles');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const farmers = await FarmerProfile.find();
  console.log(`Found ${farmers.length} farmer profiles:`);
  farmers.forEach(f => {
    console.log(`\nFarmer ID: ${f.farmerId}, User: ${f.userId}`);
    const docs = f.documents || {};
    console.log('Aadhaar:', {
      fileName: docs.aadhaarDoc?.fileName,
      fileType: docs.aadhaarDoc?.fileType,
      fileSize: docs.aadhaarDoc?.fileSize,
      fileDataLength: docs.aadhaarDoc?.fileData ? docs.aadhaarDoc.fileData.length : 0,
      fileDataPrefix: docs.aadhaarDoc?.fileData ? docs.aadhaarDoc.fileData.substring(0, 50) : 'none'
    });
    console.log('Passbook:', {
      fileName: docs.passbookDoc?.fileName,
      fileType: docs.passbookDoc?.fileType,
      fileSize: docs.passbookDoc?.fileSize,
      fileDataLength: docs.passbookDoc?.fileData ? docs.passbookDoc.fileData.length : 0,
      fileDataPrefix: docs.passbookDoc?.fileData ? docs.passbookDoc.fileData.substring(0, 50) : 'none'
    });
    console.log('LandRecord:', {
      fileName: docs.landRecordDoc?.fileName,
      fileType: docs.landRecordDoc?.fileType,
      fileSize: docs.landRecordDoc?.fileSize,
      fileDataLength: docs.landRecordDoc?.fileData ? docs.landRecordDoc.fileData.length : 0,
      fileDataPrefix: docs.landRecordDoc?.fileData ? docs.landRecordDoc.fileData.substring(0, 50) : 'none'
    });
  });

  await mongoose.disconnect();
}

main().catch(console.error);
