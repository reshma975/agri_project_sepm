import 'dotenv/config';
import { connectDB, closeDB } from '../config/db.js';
import { CropRegistration } from '../models/CropRegistration.js';

async function clean() {
  await connectDB();
  const crops = await CropRegistration.find({
    officerComment: { $regex: /\[LAND\]/i }
  });
  console.log(`Found ${crops.length} crops with [LAND] in officerComment to clean`);

  for (const crop of crops) {
    crop.officerComment = '';
    await crop.save();
    console.log(`✓ Cleaned [LAND] comment from crop: ${crop.cropName} (${crop.registrationId})`);
  }

  await closeDB();
  process.exit(0);
}

clean().catch(e => { console.error(e); process.exit(1); });
