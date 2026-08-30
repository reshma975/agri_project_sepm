import 'dotenv/config';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Land } from '../models/Land.js';
import { OfficerProfile } from '../models/OfficerProfile.js';

async function check() {
  await connectDB();
  const officers = await OfficerProfile.find().populate('userId', 'name email role').lean();
  console.log(`Found ${officers.length} officers in database:`);

  for (const ofc of officers) {
    const ofcMandal = (ofc.mandal || 'Penamaluru').trim();
    const lands = await Land.find({
      mandal: new RegExp(`^${ofcMandal}$`, 'i')
    });
    console.log(`\nOfficer: ${ofc.userId?.name || ofc.officerId} (Mandal: "${ofcMandal}")`);
    console.log(`  -> Strictly matching lands count: ${lands.length}`);
    lands.forEach(l => {
      console.log(`     • Survey No. ${l.surveyNumber} (${l.landId}) - Mandal: ${l.mandal} [Status: ${l.overallVerificationStatus}]`);
    });
  }

  await closeDB();
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
