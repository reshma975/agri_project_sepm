import 'dotenv/config';
import { connectDB, closeDB } from '../config/db.js';
import { Land } from '../models/Land.js';
import { CropRegistration } from '../models/CropRegistration.js';
import { VerificationIssue } from '../models/VerificationIssue.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { OfficerProfile } from '../models/OfficerProfile.js';

async function testFlow() {
  await connectDB();
  console.log('--- Testing Land-Centric Verification & Granular Issues ---');

  // Find the parcel for Survey 99/12
  const land = await Land.findOne({ surveyNumber: '99/12' });
  if (!land) {
    console.error('Survey 99/12 not found!');
    process.exit(1);
  }
  console.log('✓ Found Land Parcel:', land.landId, 'Survey:', land.surveyNumber, 'Total Area:', land.totalArea, 'Acres');

  const crops = await CropRegistration.find({
    $or: [{ landId: land._id }, { surveyNumber: '99/12' }]
  });
  console.log(`✓ Found ${crops.length} crops on this parcel:`);
  crops.forEach(c => console.log(`   - ${c.cropName} (${c.cultivatedArea} Ac) [ID: ${c._id}, Status: ${c.status}]`));

  const cotton = crops.find(c => c.cropName.toLowerCase().includes('cotton'));
  const redGram = crops.find(c => c.cropName.toLowerCase().includes('red gram'));

  // Clean up any old test issues
  await VerificationIssue.deleteMany({ landId: land._id });

  // Simulate Officer returning parcel with 2 granular issues:
  // 1 Land/Document issue + 1 Red Gram crop issue
  console.log('\n--- Simulating Officer returning parcel with 2 Granular Issues ---');
  const landIssue = await VerificationIssue.create({
    landId: land._id,
    farmerId: land.farmerId,
    cropId: null,
    issueLevel: 'LAND',
    issueType: 'DOCUMENT_UNCLEAR',
    description: 'Please upload a clearer copy of Land Title 1-B / Adangal document.',
    status: 'OPEN',
    officerName: 'Agriculture Officer'
  });
  console.log('✓ Created LAND Issue:', landIssue.issueId, 'Level:', landIssue.issueLevel, 'Target cropId:', landIssue.cropId);

  let redGramIssue = null;
  if (redGram) {
    redGramIssue = await VerificationIssue.create({
      landId: land._id,
      farmerId: land.farmerId,
      cropId: redGram._id,
      issueLevel: 'CROP',
      issueType: 'SOWING_DATE_MISMATCH',
      description: 'Please correct the sowing date for Red Gram (Survey sowing window discrepancy).',
      status: 'OPEN',
      officerName: 'Agriculture Officer'
    });
    console.log('✓ Created CROP Issue for Red Gram:', redGramIssue.issueId, 'Level:', redGramIssue.issueLevel, 'Target cropId:', redGramIssue.cropId);
  }

  land.overallVerificationStatus = 'RESUBMIT_NEEDED';
  await land.save();

  if (redGram) {
    redGram.status = 'RETURNED_FOR_CORRECTION';
    await redGram.save();
  }

  console.log('✓ Land Parcel overallVerificationStatus is now:', land.overallVerificationStatus);

  // Test farmer issue isolation:
  const openIssues = await VerificationIssue.find({ landId: land._id, status: 'OPEN' });
  const landLevelIssues = openIssues.filter(i => i.issueLevel === 'LAND');
  const cottonIssues = openIssues.filter(i => i.cropId?.toString() === cotton?._id?.toString());
  const redGramIssues = openIssues.filter(i => i.cropId?.toString() === redGram?._id?.toString());

  console.log('\n--- Granular Targeted Display Verification ---');
  console.log('✓ Land Banner Issues Count:', landLevelIssues.length, '(Expected: 1)');
  console.log('   Note:', landLevelIssues[0]?.description);
  console.log('✓ Cotton Issues Count:', cottonIssues.length, '(Expected: 0 - Clean!)');
  console.log('✓ Red Gram Issues Count:', redGramIssues.length, '(Expected: 1)');
  console.log('   Note:', redGramIssues[0]?.description);

  if (cottonIssues.length === 0 && redGramIssues.length === 1 && landLevelIssues.length === 1) {
    console.log('\n🌟 SUCCESS: Granular issue isolation verified perfectly!');
  } else {
    console.error('❌ Failed issue isolation logic');
  }

  await closeDB();
  process.exit(0);
}

testFlow().catch(err => {
  console.error(err);
  process.exit(1);
});
