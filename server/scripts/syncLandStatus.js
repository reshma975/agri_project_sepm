import 'dotenv/config';
import { connectDB, closeDB } from '../config/db.js';
import { Land } from '../models/Land.js';
import { CropRegistration } from '../models/CropRegistration.js';

async function run() {
  await connectDB();
  const lands = await Land.find();
  console.log(`Found ${lands.length} lands to synchronize`);

  for (const land of lands) {
    const crops = await CropRegistration.find({
      $or: [
        { landId: land._id },
        { farmerId: land.farmerId, surveyNumber: land.surveyNumber }
      ]
    });

    if (crops.some((c) => c.status === 'RETURNED_FOR_CORRECTION')) {
      land.overallVerificationStatus = 'RESUBMIT_NEEDED';
    } else if (crops.length > 0 && crops.every((c) => c.status === 'VERIFIED')) {
      land.overallVerificationStatus = 'VERIFIED';
    } else if (crops.some((c) => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status))) {
      land.overallVerificationStatus = 'SUBMITTED';
    } else {
      land.overallVerificationStatus = 'DRAFT';
    }

    await land.save();
    console.log(`✓ Land Survey ${land.surveyNumber} (${land.landId}) -> ${land.overallVerificationStatus} (${crops.length} crops: ${crops.map(c => `${c.cropName}:${c.status}`).join(', ')})`);
  }

  await closeDB();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
