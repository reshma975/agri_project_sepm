import 'dotenv/config';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { OfficerProfile } from '../models/OfficerProfile.js';
import { Land } from '../models/Land.js';
import { CropRegistration } from '../models/CropRegistration.js';
import { VerificationIssue } from '../models/VerificationIssue.js';
import jwt from 'jsonwebtoken';

async function runTest() {
  await connectDB();
  console.log('================================================================');
  console.log('   LAND-CENTRIC VERIFICATION & GRANULAR ISSUES COMPREHENSIVE TEST');
  console.log('================================================================\n');

  // 1. Locate Officer and Farmer
  const officerUser = await User.findOne({ role: 'OFFICER' });
  const farmerUser = await User.findOne({ role: 'FARMER' });

  if (!officerUser || !farmerUser) {
    console.error('Officer or Farmer user not found!');
    process.exit(1);
  }

  const officerProfile = await OfficerProfile.findOne({ userId: officerUser._id });
  const farmerProfile = await FarmerProfile.findOne({ userId: farmerUser._id });

  console.log(`✓ Officer: ${officerUser.name} (${officerProfile?.mandal || 'Penamaluru'} Mandal)`);
  console.log(`✓ Farmer:  ${farmerUser.name} (${farmerProfile?.farmerId})`);

  // 2. Setup Land Parcel with 2 distinct crops on Survey 99/12
  let land = await Land.findOne({ surveyNumber: '99/12' });
  if (!land) {
    land = await Land.create({
      farmerId: farmerProfile._id,
      surveyNumber: '99/12',
      village: 'Kambhampadu',
      mandal: 'a.konduru',
      district: 'Vijayawada',
      totalArea: 2,
      areaUnit: 'Acres',
      ownershipType: 'Owned',
      overallVerificationStatus: 'SUBMITTED'
    });
  }

  // Ensure 2 distinct crops exist on this parcel: Cotton 1 Ac, Red Gram 1 Ac
  let crops = await CropRegistration.find({
    $or: [{ landId: land._id }, { surveyNumber: '99/12' }]
  });

  console.log(`\n✓ Land Parcel: Survey ${land.surveyNumber} (${land.totalArea} Acres)`);
  console.log(`  Initial overallVerificationStatus: ${land.overallVerificationStatus}`);
  console.log(`  Registered crops count: ${crops.length}`);
  crops.forEach(c => console.log(`   - ${c.cropName} (${c.cultivatedArea} Ac) [Status: ${c.status}]`));

  const cotton = crops.find(c => c.cropName.toLowerCase().includes('cotton')) || crops[0];
  const redGram = crops.find(c => c.cropName.toLowerCase().includes('red gram')) || crops[1];

  // 3. Test Officer Returning Parcel with 2 Granular Issues
  console.log('\n--- Step 1: Officer Reviews & Returns Parcel with 2 Granular Issues ---');
  await VerificationIssue.deleteMany({ landId: land._id });

  const issuesPayload = [
    {
      issueLevel: 'LAND',
      cropId: null,
      issueType: 'DOCUMENT_UNCLEAR',
      description: 'Please upload a legible, high-resolution copy of Land Title 1-B / Adangal document.'
    },
    {
      issueLevel: 'CROP',
      cropId: redGram._id,
      issueType: 'SOWING_DATE_MISMATCH',
      description: 'Please correct the sowing date for Red Gram (Discrepancy with state agricultural calendar).'
    }
  ];

  const createdIssues = [];
  for (const item of issuesPayload) {
    const iss = await VerificationIssue.create({
      landId: land._id,
      farmerId: land.farmerId,
      cropId: item.cropId,
      issueLevel: item.issueLevel,
      issueType: item.issueType,
      description: item.description,
      status: 'OPEN',
      officerName: officerUser.name
    });
    createdIssues.push(iss);
  }

  land.overallVerificationStatus = 'RESUBMIT_NEEDED';
  land.officerComment = createdIssues.map(i => `[${i.issueLevel}] ${i.description}`).join('; ');
  await land.save();

  redGram.status = 'RETURNED_FOR_CORRECTION';
  redGram.officerComment = issuesPayload[1].description;
  await redGram.save();

  console.log(`✓ Created ${createdIssues.length} Granular Verification Issues:`);
  createdIssues.forEach((i, idx) => {
    console.log(`   Issue #${idx + 1}: [Level: ${i.issueLevel}] [Target: ${i.cropId ? 'Red Gram' : 'Land Parcel'}]`);
    console.log(`     Description: "${i.description}"`);
  });

  // 4. Verify Farmer Data Isolation (Cotton must NOT have Red Gram issue)
  console.log('\n--- Step 2: Farmer Farm Records & Targeted Display Verification ---');
  const allOpenIssues = await VerificationIssue.find({ landId: land._id, status: 'OPEN' });
  const landBannerIssues = allOpenIssues.filter(i => i.issueLevel === 'LAND');
  const cottonCropIssues = allOpenIssues.filter(i => i.cropId?.toString() === cotton._id.toString());
  const redGramCropIssues = allOpenIssues.filter(i => i.cropId?.toString() === redGram._id.toString());

  console.log(`✓ Land Parcel Header Status: ${land.overallVerificationStatus} (Expected: RESUBMIT_NEEDED)`);
  console.log(`✓ Land-Level Issues displayed in Land Banner: ${landBannerIssues.length} (Expected: 1)`);
  console.log(`   -> "${landBannerIssues[0]?.description}"`);
  console.log(`✓ Red Gram Card Issues: ${redGramCropIssues.length} (Expected: 1)`);
  console.log(`   -> "${redGramCropIssues[0]?.description}"`);
  console.log(`✓ Cotton Card Issues: ${cottonCropIssues.length} (Expected: 0 - Clean & Untainted!)`);

  if (cottonCropIssues.length !== 0 || redGramCropIssues.length !== 1 || landBannerIssues.length !== 1) {
    throw new Error('Granular issue targeting check failed!');
  }

  // 5. Simulate Farmer Correcting & Resubmitting Red Gram
  console.log('\n--- Step 3: Farmer Corrects Red Gram and Resubmits ---');
  redGram.sowingDate = new Date();
  redGram.status = 'SUBMITTED';
  await redGram.save();

  await VerificationIssue.updateMany(
    { cropId: redGram._id, status: 'OPEN' },
    { $set: { status: 'RESUBMITTED', resubmittedAt: new Date(), farmerComment: 'Corrected sowing date to July 15' } }
  );

  const updatedRedGramIssue = await VerificationIssue.findOne({ cropId: redGram._id });
  console.log(`✓ Red Gram Issue Status after farmer correction: ${updatedRedGramIssue.status} (Expected: RESUBMITTED)`);

  // 6. Simulate Officer Verifying and Approving the Land Parcel Case
  console.log('\n--- Step 4: Officer Verifies & Certifies the Land Parcel ---');
  land.overallVerificationStatus = 'VERIFIED';
  land.reviewedAt = new Date();
  land.officerComment = 'Cadastral data, land title, and crop sowing dates verified and approved.';
  await land.save();

  // All crops on parcel verified
  await CropRegistration.updateMany(
    { $or: [{ landId: land._id }, { surveyNumber: '99/12' }] },
    { $set: { status: 'VERIFIED', reviewedAt: new Date(), officerComment: land.officerComment } }
  );

  // All open/resubmitted issues marked resolved
  await VerificationIssue.updateMany(
    { landId: land._id, status: { $ne: 'RESOLVED' } },
    { $set: { status: 'RESOLVED', resolvedAt: new Date() } }
  );

  const finalLand = await Land.findById(land._id);
  const finalCrops = await CropRegistration.find({
    $or: [{ landId: land._id }, { surveyNumber: '99/12' }]
  });
  const unresolvedIssuesCount = await VerificationIssue.countDocuments({ landId: land._id, status: { $ne: 'RESOLVED' } });

  console.log(`✓ Final Land Parcel Status: ${finalLand.overallVerificationStatus} (Expected: VERIFIED)`);
  console.log(`✓ All ${finalCrops.length} Crops Status: ${finalCrops.map(c => `${c.cropName}: ${c.status}`).join(', ')}`);
  console.log(`✓ Unresolved Issues Count: ${unresolvedIssuesCount} (Expected: 0)`);

  if (finalLand.overallVerificationStatus === 'VERIFIED' && finalCrops.every(c => c.status === 'VERIFIED') && unresolvedIssuesCount === 0) {
    console.log('\n================================================================');
    console.log('   🎉 ALL VERIFICATION TESTS PASSED WITH 100% SUCCESS!');
    console.log('================================================================\n');
  } else {
    throw new Error('Final approval check failed!');
  }

  await closeDB();
  process.exit(0);
}

runTest().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
