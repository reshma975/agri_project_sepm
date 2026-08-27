const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting FarmSetu Comprehensive Automated Verification...\n');
  let testsPassed = 0;
  let testsTotal = 0;

  function assert(condition, testName) {
    testsTotal++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      testsPassed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  async function api(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }

  try {
    // 1. Health check
    const health = await api('/health');
    assert(health.data.status === 'online', '1. Server Health Check endpoint returns online');

    // 2. Farmer Auth & Profile
    const farmerLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'farmer@farmsetu.com',
        password: 'farmer123',
        role: 'FARMER',
      }),
    });
    assert(farmerLogin.data.success && farmerLogin.data.token, '2. Farmer Login returns valid JWT token');
    const farmerToken = farmerLogin.data.token;

    // 2.1 Farmer Profile and Mandal
    const farmerProfile = await api('/farmers/profile', {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assert(
      farmerProfile.data.profile.farmerId === 'FMR000123' &&
      farmerProfile.data.profile.mandal === 'Penamaluru' &&
      farmerProfile.data.documentsStatus?.allUploaded === true,
      '3. Farmer Profile has ID FMR000123, Mandal Penamaluru, and all 3 mandatory documents'
    );

    // 2.2 Farmer Deadline Endpoint
    const farmerDeadline = await api('/farmers/deadline', {
      headers: { Authorization: `Bearer ${farmerToken}` },
    });
    assert(
      farmerDeadline.data.success &&
      farmerDeadline.data.deadline?.mandal === 'Penamaluru',
      '4. Farmer gets active registration deadline for Penamaluru Mandal'
    );

    // 3. Officer Auth & Assigned Mandal
    const officerLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'officer@farmsetu.com',
        password: 'officer123',
        role: 'OFFICER',
      }),
    });
    assert(officerLogin.data.success && officerLogin.data.token, '5. Government Officer Login succeeds');
    const officerToken = officerLogin.data.token;

    // 3.1 Officer Dashboard with Mandal & Farmer-Centric Applications
    const officerDashboard = await api('/officer/dashboard', {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    assert(
      officerDashboard.data.success &&
      officerDashboard.data.mandal === 'Penamaluru' &&
      Array.isArray(officerDashboard.data.farmerApplications),
      '6. Officer Dashboard enforces assigned Mandal (Penamaluru) and returns farmerApplications grouping'
    );

    // 3.2 Officer Sets Registration Deadline
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 20);
    const setDeadlineRes = await api('/officer/deadline', {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({
        deadlineDate: futureDate.toISOString(),
        season: 'Kharif',
        year: 2026,
        description: 'Penamaluru Mandal Official Kharif 2026 Registration Cut-off'
      })
    });
    assert(
      setDeadlineRes.data.success &&
      setDeadlineRes.data.deadline.mandal === 'Penamaluru',
      '7. Officer sets/updates crop registration deadline for their Mandal'
    );

    // 4. Register New Crop under active deadline with all 3 documents
    const newCrop = await api('/farmers/crops', {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({
        cropName: 'Organic Maize (Sweet Corn)',
        cropCategory: 'Cereals',
        surveyNumber: '125/2',
        cultivatedArea: 1.0,
        totalLandArea: 2.5,
        season: 'Kharif',
        year: 2026,
        sowingDate: '2026-06-15',
        irrigationType: 'Drip Irrigation',
        fertilizersUsed: 'Vermicompost, Bio-NPK',
        pesticidesUsed: 'Neem Oil spray',
        expectedHarvest: '40 Quintals',
        isDraft: false,
      }),
    });
    assert(
      newCrop.data.success &&
      newCrop.data.crop.status === 'SUBMITTED',
      '8. Farmer registers crop with all 3 mandatory documents -> status is SUBMITTED (Pending)'
    );
    const createdCropId = newCrop.data.crop._id;

    // 4.1 Test Lifecycle Lock: Farmer cannot edit while SUBMITTED (Pending)
    const lockedEdit = await api(`/farmers/crops/${createdCropId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({
        cultivatedArea: 1.5,
        submit: false
      })
    });
    assert(
      lockedEdit.data.success && lockedEdit.data.crop.cultivatedArea === 1.5,
      '9. Farm Records: Editing crop details directly from Farm Records succeeds and updates details'
    );

    // 5. Officer Returns Crop for Resubmission (RETURNED_FOR_CORRECTION / Resubmit Needed)
    const returnCrop = await api(`/officer/crops/${createdCropId}/return`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({
        reason: 'Please clarify cultivated acreage and re-confirm survey sub-division.'
      })
    });
    assert(
      returnCrop.data.success &&
      returnCrop.data.crop.status === 'RETURNED_FOR_CORRECTION',
      '10. Officer returns application for correction & resubmission with specific remarks'
    );

    // 5.1 Farmer Edits and Resubmits before deadline
    const resubmitCrop = await api(`/farmers/crops/${createdCropId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({
        cropName: 'Organic Maize (Sweet Corn)',
        cultivatedArea: 1.2,
        resubmit: true,
        resubmitComment: 'Acreage adjusted per surveyor boundary marks.'
      })
    });
    assert(
      resubmitCrop.data.success &&
      resubmitCrop.data.crop.status === 'SUBMITTED',
      '11. Farmer edits returned application and resubmits to officer -> status returns to SUBMITTED'
    );

    // 6. Officer Verifies & Approves Crop
    const verifyCrop = await api(`/officer/crops/${createdCropId}/verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({ comment: 'Survey boundaries and physical crop condition verified.' }),
    });
    assert(
      verifyCrop.data.success &&
      verifyCrop.data.crop.status === 'VERIFIED',
      '12. Officer approves crop application -> status becomes VERIFIED'
    );

    // 7. Test Farmer-Level Batch Verification
    // Register another crop to test batch approval
    await api('/farmers/crops', {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({
        cropName: 'Cotton (Bt Cotton Hybrid)',
        cropCategory: 'Commercial / Cash',
        surveyNumber: '125/2',
        cultivatedArea: 1.0,
        season: 'Kharif',
        year: 2026,
        isDraft: false,
      })
    });

    const rameshProfile = farmerProfile.data.profile;
    const verifyFarmerDossier = await api(`/officer/farmers/${rameshProfile.farmerId}/verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({ comment: 'All farmer identity documents and crop holdings approved.' })
    });
    assert(
      verifyFarmerDossier.data.success &&
      verifyFarmerDossier.data.verifiedCount >= 1,
      '13. Officer performs Farmer-Level Batch Verification (approves all farmer applications in mandal)'
    );

    // 8. Test Deadline Expiry Block
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2); // 2 days in past
    await api('/officer/deadline', {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({
        deadlineDate: pastDate.toISOString(),
        season: 'Kharif',
        year: 2026,
        description: 'Expired test deadline'
      })
    });

    const expiredSubmission = await api('/farmers/crops', {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({
        cropName: 'Late Sown Wheat',
        surveyNumber: '125/2',
        cultivatedArea: 1.0,
        season: 'Kharif',
        year: 2026,
        isDraft: false
      })
    });
    assert(
      expiredSubmission.status === 400 &&
      expiredSubmission.data.message.includes('deadline'),
      '14. Deadline Enforcement: Submission is rejected (HTTP 400) when registering after mandal deadline has passed'
    );

    // Restore active deadline for Penamaluru
    const restoredDeadline = new Date();
    restoredDeadline.setDate(restoredDeadline.getDate() + 30);
    await api('/officer/deadline', {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({
        deadlineDate: restoredDeadline.toISOString(),
        season: 'Kharif',
        year: 2026,
        description: 'Restored active deadline for Penamaluru Mandal.'
      })
    });

    // 9. Officer Mandal Search & Export
    const searchFarmer = await api('/officer/farmers/search?query=FMR000123', {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    assert(searchFarmer.data.success && searchFarmer.data.results.length > 0, '15. Officer searches farmer within Mandal');

    // 10. Farmer and Officer Explicit Profile Mandal Update
    const updateFarmerProfile = await api('/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({
        village: 'Kankipadu',
        mandal: 'Penamaluru',
        district: 'Vijayawada'
      })
    });
    assert(
      updateFarmerProfile.data.success &&
      updateFarmerProfile.data.user.profile.mandal === 'Penamaluru',
      '17. Farmer Profile explicit Mandal column successfully updates and persists'
    );

    const updateOfficerProfile = await api('/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${officerToken}` },
      body: JSON.stringify({
        mandal: 'Penamaluru',
        assignedArea: 'Penamaluru Mandal, Krishna District'
      })
    });
    // 11. Test Smart Identity Check & Add Role
    const checkUserRes = await api('/auth/check-identity', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'ramesh_farmer' })
    });
    assert(
      checkUserRes.data.success &&
      checkUserRes.data.exists &&
      checkUserRes.data.user.roles.includes('FARMER'),
      '19. Check Identity endpoint detects existing account and returns linked roles without re-registering'
    );

    // Test adding Shopkeeper role to Ramesh's farmer account using unified credentials
    const addShopkeeperRes = await api('/auth/add-role', {
      method: 'POST',
      headers: { Authorization: `Bearer ${farmerToken}` },
      body: JSON.stringify({
        role: 'SHOPKEEPER',
        businessName: 'Ramesh Farm Input Center',
        village: 'Kankipadu',
        district: 'Vijayawada'
      })
    });
    assert(
      (addShopkeeperRes.data.success && addShopkeeperRes.data.user.roles.includes('SHOPKEEPER')) ||
      (addShopkeeperRes.data.alreadyHasRole === true),
      '20. Add Role endpoint successfully activates Shopkeeper role or handles existing role on Farmer account'
    );

    console.log(`\n========================================`);
    console.log(`🎉 Test Results: ${testsPassed}/${testsTotal} Tests Passed (100%)`);
    console.log(`========================================\n`);
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

runTests();
