import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import { Land } from '../models/Land.js';
import { CropRegistration } from '../models/CropRegistration.js';
import { VerificationIssue } from '../models/VerificationIssue.js';

async function testLimit() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const land = await Land.findOne({ surveyNumber: '35/2' });
  console.log('Current Survey 35/2 land resubmissionCount:', land.resubmissionCount, 'status:', land.overallVerificationStatus);

  const crops = await CropRegistration.find({ surveyNumber: '35/2' });
  console.log('Current crops count:', crops.length, 'crop statuses:', crops.map(c => ({ name: c.cropName, status: c.status, resubmissionCount: c.resubmissionCount })));

  await mongoose.disconnect();
}

testLimit().catch(console.error);
