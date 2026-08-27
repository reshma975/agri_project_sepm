import { FarmerProfile } from '../models/FarmerProfile.js';
import { Land } from '../models/Land.js';
import { CropRegistration } from '../models/CropRegistration.js';
import { CropRegistrationHistory } from '../models/CropRegistrationHistory.js';
import { User } from '../models/User.js';
import { RegistrationDeadline } from '../models/RegistrationDeadline.js';

// Helper to check if farmer has uploaded all 3 required documents
const checkFarmerDocuments = (profile) => {
  const docs = profile?.documents || {};
  const missingDocs = [];

  if (!docs.aadhaarDoc?.fileName) missingDocs.push('Aadhaar Card');
  if (!docs.passbookDoc?.fileName) missingDocs.push('Bank Passbook');
  if (!docs.landRecordDoc?.fileName) missingDocs.push('Land Title Record');

  return {
    valid: missingDocs.length === 0,
    missingDocs
  };
};

// Helper to check deadlines strictly for mandals where the farmer owns land parcels
const getFarmerMandalDeadlines = async (profile, lands = []) => {
  const mandalSet = new Set();
  
  // Collect all mandals from the farmer's registered land parcels
  lands.forEach(l => {
    if (l.mandal && l.mandal.trim()) {
      mandalSet.add(l.mandal.trim());
    }
  });

  // If no lands yet, fallback to profile mandal
  if (mandalSet.size === 0 && profile?.mandal && profile.mandal.trim()) {
    mandalSet.add(profile.mandal.trim());
  }

  const mandalDeadlines = [];
  const now = new Date();

  // Query active registration deadline set by officer for each mandal of the farmer's lands
  for (const mandal of mandalSet) {
    const deadline = await RegistrationDeadline.findOne({
      mandal: new RegExp(`^${mandal}$`, 'i'),
      isActive: true
    }).sort({ createdAt: -1 });

    if (deadline) {
      const deadlineDate = new Date(deadline.deadlineDate);
      const landsInMandal = lands.filter(
        l => l.mandal && l.mandal.trim().toLowerCase() === mandal.toLowerCase()
      ).length;

      mandalDeadlines.push({
        mandal: deadline.mandal,
        district: deadline.district,
        season: deadline.season,
        year: deadline.year,
        deadlineDate: deadline.deadlineDate,
        isDeadlinePassed: now > deadlineDate,
        deadline,
        landsCount: landsInMandal,
        isProfileMandal: profile?.mandal?.toLowerCase() === mandal.toLowerCase()
      });
    }
  }

  return mandalDeadlines;
};

// Helper to check if crop registration deadline for farmer's mandal has expired
const checkMandalDeadline = async (mandal) => {
  if (!mandal) return { passed: false, deadline: null };

  const deadline = await RegistrationDeadline.findOne({
    mandal: new RegExp(`^${mandal.trim()}$`, 'i'),
    isActive: true
  }).sort({ createdAt: -1 });

  if (!deadline) {
    return { passed: false, deadline: null };
  }

  const now = new Date();
  const deadlineDate = new Date(deadline.deadlineDate);

  return {
    passed: now > deadlineDate,
    deadline
  };
};

// @desc    Get farmer profile details, stats, and active registration deadline for farmer's mandal
// @route   GET /api/farmers/profile
// @access  Private (FARMER)
export const getFarmerProfile = async (req, res) => {
  try {
    let profile = await FarmerProfile.findOne({
      $or: [{ userId: req.user._id }, { _id: req.user._id }]
    });
    if (!profile) {
      profile = await FarmerProfile.create({
        userId: req.user._id,
        farmerId: `FMR${Math.floor(100000 + Math.random() * 900000)}`,
        village: 'Kankipadu',
        mandal: 'Penamaluru',
        district: 'Vijayawada',
        state: 'Andhra Pradesh'
      });
    }

    const farmerIdMatch = { $or: [{ farmerId: profile._id }, { farmerId: req.user._id }] };
    const lands = await Land.find(farmerIdMatch).sort({ createdAt: -1 });
    const cropCount = await CropRegistration.countDocuments(farmerIdMatch);
    const verifiedCropCount = await CropRegistration.countDocuments({
      ...farmerIdMatch,
      status: 'VERIFIED'
    });
    const pendingCropCount = await CropRegistration.countDocuments({
      ...farmerIdMatch,
      status: { $in: ['SUBMITTED', 'UNDER_VERIFICATION'] }
    });
    const returnedCropCount = await CropRegistration.countDocuments({
      ...farmerIdMatch,
      status: 'RETURNED_FOR_CORRECTION'
    });

    const docsCheck = checkFarmerDocuments(profile);
    const primaryDeadlineCheck = await checkMandalDeadline(profile.mandal || 'Penamaluru');
    const mandalDeadlines = await getFarmerMandalDeadlines(profile, lands);

    return res.status(200).json({
      success: true,
      profile,
      lands,
      documentsStatus: {
        allUploaded: docsCheck.valid,
        missingDocs: docsCheck.missingDocs
      },
      deadline: primaryDeadlineCheck.deadline,
      isDeadlinePassed: primaryDeadlineCheck.passed,
      mandalDeadlines,
      stats: {
        totalLands: lands.length,
        totalCrops: cropCount,
        verifiedCrops: verifiedCropCount,
        pendingCrops: pendingCropCount,
        returnedCrops: returnedCropCount
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active registration deadline for the farmer's mandal and lands
// @route   GET /api/farmers/deadline
// @access  Private (FARMER)
export const getFarmerDeadline = async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({
      $or: [{ userId: req.user._id }, { _id: req.user._id }]
    });
    const lands = profile
      ? await Land.find({ $or: [{ farmerId: profile._id }, { farmerId: req.user._id }] })
      : [];
    const farmerMandal = profile?.mandal || 'Penamaluru';

    const deadlineCheck = await checkMandalDeadline(farmerMandal);
    const mandalDeadlines = await getFarmerMandalDeadlines(profile, lands);

    return res.status(200).json({
      success: true,
      mandal: farmerMandal,
      deadline: deadlineCheck.deadline,
      isDeadlinePassed: deadlineCheck.passed,
      mandalDeadlines
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get farmer lands
// @route   GET /api/farmers/lands
// @access  Private (FARMER)
export const getFarmerLands = async (req, res) => {
  try {
    let profile = await FarmerProfile.findOne({
      $or: [{ userId: req.user._id }, { _id: req.user._id }]
    });
    if (!profile) {
      profile = await FarmerProfile.create({
        userId: req.user._id,
        farmerId: `FMR${Math.floor(100000 + Math.random() * 900000)}`,
        village: 'Kankipadu',
        mandal: 'Penamaluru',
        district: 'Vijayawada',
        state: 'Andhra Pradesh'
      });
    }

    const lands = await Land.find({
      $or: [{ farmerId: profile._id }, { farmerId: req.user._id }]
    }).sort({ createdAt: -1 });

    // Ensure all lands have a unique landId
    for (const land of lands) {
      if (!land.landId) {
        land.landId = `LND${Math.floor(10000 + Math.random() * 90000)}`;
        await land.save();
      }
    }

    return res.status(200).json({ success: true, lands });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new land parcel (with optional crop)
// @route   POST /api/farmers/lands
// @access  Private (FARMER)
export const createLand = async (req, res) => {
  try {
    let profile = await FarmerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await FarmerProfile.create({
        userId: req.user._id,
        farmerId: `FMR${Math.floor(100000 + Math.random() * 900000)}`,
        village: req.body.village || 'Kankipadu',
        mandal: req.body.mandal || 'Penamaluru',
        district: req.body.district || 'Vijayawada',
        state: 'Andhra Pradesh'
      });
    }

    const {
      surveyNumber,
      village,
      mandal,
      district,
      totalArea,
      areaUnit,
      ownershipType,
      currentCrop,
      cropCategory,
      estimatedDurationMonths,
      season
    } = req.body;

    const targetSurvey = (surveyNumber || '').trim();
    if (!targetSurvey) {
      return res.status(400).json({ success: false, message: 'Survey number is required' });
    }

    // Check if land parcel survey number already exists for this farmer
    const existingLand = await Land.findOne({ farmerId: profile._id, surveyNumber: targetSurvey });
    if (existingLand) {
      if (!currentCrop || !currentCrop.trim()) {
        return res.status(400).json({
          success: false,
          message: `Land parcel with Survey No. ${targetSurvey} is already registered. To add a crop to this parcel, please provide the crop name below.`
        });
      }

      // Check if this exact crop is already registered on this land parcel
      const duplicateCrop = await CropRegistration.findOne({
        farmerId: profile._id,
        $or: [
          { landId: existingLand._id, cropName: { $regex: new RegExp(`^${currentCrop.trim()}$`, 'i') } },
          { surveyNumber: targetSurvey, cropName: { $regex: new RegExp(`^${currentCrop.trim()}$`, 'i') } }
        ]
      });

      if (duplicateCrop) {
        return res.status(400).json({
          success: false,
          message: `Crop "${currentCrop.trim()}" is already registered on Survey No. ${targetSurvey}. You can add other distinct crops to this parcel.`
        });
      }

      const farmerMandal = existingLand.mandal || profile.mandal || 'Penamaluru';

      // Register the new crop on this existing land parcel with locked cadastral location
      const registeredCrop = await CropRegistration.create({
        farmerId: profile._id,
        landId: existingLand._id,
        village: existingLand.village || profile.village || 'Kankipadu',
        mandal: farmerMandal,
        district: existingLand.district || profile.district || 'Vijayawada',
        cropName: currentCrop.trim(),
        cropCategory: cropCategory && cropCategory !== 'None' ? cropCategory : 'Cereals',
        surveyNumber: existingLand.surveyNumber,
        cultivatedArea: Number(totalArea) || existingLand.totalArea || 1,
        totalLandArea: existingLand.totalArea || Number(totalArea) || 1,
        areaUnit: existingLand.areaUnit || areaUnit || 'Acres',
        ownershipType: existingLand.ownershipType || ownershipType || 'Owned',
        season: season || 'Kharif',
        year: new Date().getFullYear(),
        sowingDate: new Date(),
        irrigationType: 'Borewell',
        status: 'DRAFT',
        submittedAt: null
      });

      await CropRegistrationHistory.create({
        registrationId: registeredCrop._id,
        action: 'DRAFT_RECORDED',
        comment: `New crop "${currentCrop.trim()}" recorded on Survey No. ${targetSurvey} (Draft - ready for mandal registration)`,
        officerName: 'Farmer Farm Records'
      });

      return res.status(201).json({
        success: true,
        message: `Crop "${currentCrop.trim()}" added to Survey No. ${targetSurvey} successfully!`,
        land: existingLand,
        registeredCrop
      });
    }

    const land = await Land.create({
      farmerId: profile._id,
      surveyNumber: targetSurvey,
      village: village || profile.village || 'Kankipadu',
      mandal: mandal || profile.mandal || 'Penamaluru',
      district: district || profile.district || 'Vijayawada',
      totalArea: Number(totalArea) || 1,
      areaUnit: areaUnit || 'Acres',
      ownershipType: ownershipType || 'Owned',
      currentCrop: currentCrop ? currentCrop.trim() : '',
      cropCategory: cropCategory || (currentCrop ? 'Cereals' : 'None'),
      estimatedDurationMonths: estimatedDurationMonths ? Number(estimatedDurationMonths) : null,
    });

    // If an initial crop was provided, auto-register this crop under the new land parcel
    let registeredCrop = null;
    if (currentCrop && currentCrop.trim()) {
      const farmerMandal = land.mandal || profile.mandal || 'Penamaluru';

      registeredCrop = await CropRegistration.create({
        farmerId: profile._id,
        landId: land._id,
        village: land.village || village || profile.village || '',
        mandal: farmerMandal,
        district: land.district || district || profile.district || 'Vijayawada',
        cropName: currentCrop.trim(),
        cropCategory: cropCategory && cropCategory !== 'None' ? cropCategory : 'Cereals',
        surveyNumber: land.surveyNumber,
        cultivatedArea: Number(totalArea) || 1,
        totalLandArea: Number(totalArea) || 1,
        areaUnit: areaUnit || 'Acres',
        ownershipType: ownershipType || 'Owned',
        season: season || 'Kharif',
        year: new Date().getFullYear(),
        sowingDate: new Date(),
        irrigationType: 'Borewell',
        status: 'DRAFT',
        submittedAt: null
      });

      await CropRegistrationHistory.create({
        registrationId: registeredCrop._id,
        action: 'DRAFT_RECORDED',
        comment: `Crop recorded during land parcel registration (Duration: ${estimatedDurationMonths ? estimatedDurationMonths + ' Months' : 'Seasonal'})`,
        officerName: 'Farmer Farm Records'
      });
    }

    // Update total land area in farmer profile
    const allLands = await Land.find({ farmerId: profile._id });
    const totalAreaSum = allLands.reduce((acc, curr) => acc + (curr.totalArea || 0), 0);
    profile.totalLandArea = totalAreaSum;
    await profile.save();

    return res.status(201).json({
      success: true,
      message: `Land parcel Survey No. ${land.surveyNumber} created successfully!`,
      land,
      registeredCrop
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get crop registrations with optional year & status filter
// @route   GET /api/farmers/crops
// @access  Private (FARMER)
export const getFarmerCrops = async (req, res) => {
  try {
    let profile = await FarmerProfile.findOne({
      $or: [{ userId: req.user._id }, { _id: req.user._id }]
    });
    if (!profile) {
      profile = await FarmerProfile.create({
        userId: req.user._id,
        farmerId: `FMR${Math.floor(100000 + Math.random() * 900000)}`,
        village: 'Kankipadu',
        mandal: 'Penamaluru',
        district: 'Vijayawada',
        state: 'Andhra Pradesh'
      });
    }

    const { year, status } = req.query;
    const filter = {
      $or: [
        { farmerId: profile._id },
        { farmerId: req.user._id }
      ]
    };

    if (year && year !== 'All') {
      filter.year = Number(year);
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    const crops = await CropRegistration.find(filter)
      .populate('landId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, crops });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single crop registration by ID with history audit trail
// @route   GET /api/farmers/crops/:id
// @access  Private
export const getCropById = async (req, res) => {
  try {
    const crop = await CropRegistration.findById(req.params.id)
      .populate({
        path: 'farmerId',
        populate: { path: 'userId', select: 'name username email phone' }
      })
      .populate('landId');

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop registration not found' });
    }

    const history = await CropRegistrationHistory.find({ registrationId: crop._id }).sort({ timestamp: -1 });

    return res.status(200).json({ success: true, crop, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new crop or multiple crops under a land parcel
// @route   POST /api/farmers/crops
// @access  Private (FARMER)
export const registerCrop = async (req, res) => {
  try {
    let profile = await FarmerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await FarmerProfile.create({
        userId: req.user._id,
        farmerId: `FMR${Math.floor(100000 + Math.random() * 900000)}`,
        village: 'Kankipadu',
        mandal: 'Penamaluru',
        district: 'Vijayawada'
      });
    }

    const {
      landId,
      surveyNumber,
      village,
      mandal,
      district,
      totalLandArea,
      areaUnit,
      ownershipType,
      crops,
      isDraft,
      cropName,
      cropCategory,
      cultivatedArea,
      season,
      year,
      sowingDate,
      harvestDate,
      irrigationType,
      fertilizersUsed,
      pesticidesUsed,
      expectedHarvest
    } = req.body;

    const farmerMandal = mandal || profile.mandal || 'Penamaluru';

    // 1. If not saving as draft (i.e. submitting for verification), enforce mandatory validations:
    if (!isDraft) {
      // Check Mandal Deadline
      const deadlineCheck = await checkMandalDeadline(farmerMandal);
      if (deadlineCheck.passed) {
        return res.status(400).json({
          success: false,
          message: `The crop registration deadline for ${farmerMandal} closed on ${new Date(deadlineCheck.deadline.deadlineDate).toLocaleString()}. No new submissions can be accepted.`
        });
      }

      // Check Mandatory Documents
      const docsCheck = checkFarmerDocuments(profile);
      if (!docsCheck.valid) {
        return res.status(400).json({
          success: false,
          message: `Please upload all 3 mandatory verification documents (${docsCheck.missingDocs.join(', ')}) in your profile before submitting crops for verification.`,
          missingDocs: docsCheck.missingDocs
        });
      }
    }

    const targetSurvey = (surveyNumber || '').trim();
    if (!targetSurvey) {
      return res.status(400).json({ success: false, message: 'Survey Number is required for land parcel identification' });
    }

    // Find or create associated Land parcel
    let land = null;
    if (landId) {
      land = await Land.findOne({ _id: landId, farmerId: profile._id });
    }
    if (!land) {
      land = await Land.findOne({ farmerId: profile._id, surveyNumber: targetSurvey });
    }
    if (!land) {
      land = await Land.create({
        farmerId: profile._id,
        surveyNumber: targetSurvey,
        village: village || profile.village || 'Kankipadu',
        mandal: farmerMandal,
        district: district || profile.district || 'Vijayawada',
        totalArea: Number(totalLandArea) || Number(cultivatedArea) || 1,
        areaUnit: areaUnit || 'Acres',
        ownershipType: ownershipType || 'Owned'
      });

      // Update total land holding on farmer profile
      const allLands = await Land.find({ farmerId: profile._id });
      profile.totalLandArea = allLands.reduce((acc, curr) => acc + (curr.totalArea || 0), 0);
    }

    // Normalize crops list
    const cropList = Array.isArray(crops) && crops.length > 0
      ? crops
      : [{
          cropName,
          cropCategory,
          cultivatedArea,
          season,
          year,
          sowingDate,
          harvestDate,
          irrigationType,
          fertilizersUsed,
          pesticidesUsed,
          expectedHarvest
        }];

    if (cropList.length === 0 || !cropList[0].cropName) {
      return res.status(400).json({ success: false, message: 'Please specify at least one crop entry' });
    }

    const createdCrops = [];
    const status = isDraft ? 'DRAFT' : 'SUBMITTED';

    for (const item of cropList) {
      if (!item.cropName || !item.cultivatedArea) {
        continue;
      }

      const crop = await CropRegistration.create({
        farmerId: profile._id,
        landId: land._id,
        village: land.village || village || profile.village || '',
        mandal: land.mandal || farmerMandal || profile.mandal || 'Penamaluru',
        district: land.district || district || profile.district || 'Vijayawada',
        cropName: item.cropName,
        cropCategory: item.cropCategory || 'Cereals',
        surveyNumber: land.surveyNumber,
        cultivatedArea: Number(item.cultivatedArea),
        totalLandArea: Number(totalLandArea) || land.totalArea,
        areaUnit: areaUnit || land.areaUnit || 'Acres',
        ownershipType: ownershipType || land.ownershipType || 'Owned',
        season: item.season || 'Kharif',
        year: Number(item.year) || new Date().getFullYear(),
        sowingDate: item.sowingDate ? new Date(item.sowingDate) : new Date(),
        harvestDate: item.harvestDate ? new Date(item.harvestDate) : null,
        irrigationType: item.irrigationType || 'Borewell',
        fertilizersUsed: item.fertilizersUsed || '',
        pesticidesUsed: item.pesticidesUsed || '',
        expectedHarvest: item.expectedHarvest || '',
        status,
        submittedAt: new Date()
      });

      await CropRegistrationHistory.create({
        registrationId: crop._id,
        action: isDraft ? 'DRAFT_SAVED' : 'SUBMITTED',
        comment: isDraft ? 'Crop saved as draft' : 'Crop submitted digitally by farmer for verification',
        officerName: 'Farmer Self-Submission'
      });

      createdCrops.push(crop);
    }

    if (!isDraft && profile.registrationStatus !== 'VERIFIED') {
      profile.registrationStatus = 'UNDER_VERIFICATION';
      await profile.save();
    }

    return res.status(201).json({
      success: true,
      message: `${createdCrops.length} crop ${createdCrops.length > 1 ? 'records' : 'record'} registered successfully on Survey No. ${land.surveyNumber}`,
      crops: createdCrops,
      crop: createdCrops[0],
      land
    });
  } catch (error) {
    console.error('Register crop error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update crop (edit draft or resubmit returned application)
// @route   PUT /api/farmers/crops/:id
// @access  Private (FARMER)
export const updateCrop = async (req, res) => {
  try {
    const crop = await CropRegistration.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop registration not found' });
    }

    const profile = await FarmerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    const {
      cropName,
      cropCategory,
      surveyNumber,
      cultivatedArea,
      areaUnit,
      ownershipType,
      season,
      year,
      sowingDate,
      harvestDate,
      irrigationType,
      fertilizersUsed,
      pesticidesUsed,
      expectedHarvest,
      actualHarvest,
      priceSold,
      submit,
      resubmit,
      submitComment,
      resubmitComment
    } = req.body;

    const isDraft = crop.status === 'DRAFT';
    const isReturned = crop.status === 'RETURNED_FOR_CORRECTION';
    const isSubmitting = submit || resubmit;

    // If attempting to submit or resubmit:
    if (isSubmitting) {
      // 1. Validate Mandal Deadline
      const farmerMandal = crop.mandal || profile.mandal || 'Penamaluru';
      const deadlineCheck = await checkMandalDeadline(farmerMandal);
      if (deadlineCheck.passed) {
        return res.status(400).json({
          success: false,
          message: `The crop registration deadline for ${farmerMandal} closed on ${new Date(deadlineCheck.deadline.deadlineDate).toLocaleString()}. Resubmission is no longer accepted after the deadline.`
        });
      }

      // 2. Validate Mandatory Documents
      const docsCheck = checkFarmerDocuments(profile);
      if (!docsCheck.valid) {
        return res.status(400).json({
          success: false,
          message: `Please upload all 3 mandatory verification documents (${docsCheck.missingDocs.join(', ')}) before submitting for verification.`,
          missingDocs: docsCheck.missingDocs
        });
      }
    }

    if (cropName !== undefined && cropName.trim()) crop.cropName = cropName.trim();
    if (cropCategory !== undefined) crop.cropCategory = cropCategory;
    if (surveyNumber !== undefined && surveyNumber.trim()) crop.surveyNumber = surveyNumber.trim();
    if (cultivatedArea !== undefined && !isNaN(Number(cultivatedArea))) crop.cultivatedArea = Number(cultivatedArea);
    if (areaUnit !== undefined) crop.areaUnit = areaUnit;
    if (ownershipType !== undefined) crop.ownershipType = ownershipType;
    if (season !== undefined) crop.season = season;
    if (year !== undefined && !isNaN(Number(year))) crop.year = Number(year);
    if (sowingDate !== undefined) crop.sowingDate = sowingDate ? new Date(sowingDate) : crop.sowingDate;
    if (harvestDate !== undefined) crop.harvestDate = harvestDate ? new Date(harvestDate) : null;
    if (irrigationType !== undefined) crop.irrigationType = irrigationType;
    if (fertilizersUsed !== undefined) crop.fertilizersUsed = fertilizersUsed;
    if (pesticidesUsed !== undefined) crop.pesticidesUsed = pesticidesUsed;
    if (expectedHarvest !== undefined) crop.expectedHarvest = expectedHarvest;
    if (actualHarvest !== undefined) crop.actualHarvest = actualHarvest;
    if (priceSold !== undefined) crop.priceSold = priceSold;

    if (isSubmitting) {
      crop.status = 'SUBMITTED';
      crop.submittedAt = new Date();

      await CropRegistrationHistory.create({
        registrationId: crop._id,
        action: isDraft ? 'SUBMITTED' : 'RESUBMITTED',
        comment: isDraft
          ? (submitComment || 'Draft submitted digitally by farmer for officer verification')
          : (resubmitComment || 'Corrected and resubmitted by farmer for officer review'),
        officerName: isDraft ? 'Farmer Self-Submission' : 'Farmer Resubmission'
      });

      if (profile.registrationStatus !== 'VERIFIED') {
        profile.registrationStatus = 'UNDER_VERIFICATION';
        await profile.save();
      }
    } else if (isDraft) {
      await CropRegistrationHistory.create({
        registrationId: crop._id,
        action: 'DRAFT_SAVED',
        comment: 'Draft details updated by farmer',
        officerName: 'Farmer Self-Submission'
      });
    } else {
      await CropRegistrationHistory.create({
        registrationId: crop._id,
        action: 'UPDATED',
        comment: 'Crop details updated by farmer',
        officerName: 'Farmer Self-Submission'
      });
    }

    await crop.save();
    await crop.populate('landId');

    const responseMessage = isSubmitting
      ? (isDraft ? 'Crop submitted successfully for officer verification!' : 'Application resubmitted successfully with corrections!')
      : 'Crop details updated successfully!';

    return res.status(200).json({
      success: true,
      message: responseMessage,
      crop
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload / Replace farmer verification document
// @route   POST /api/farmers/upload-document
// @access  Private (FARMER)
export const uploadDocument = async (req, res) => {
  try {
    const { docType, fileName, fileSize, fileType, fileData } = req.body;

    const profile = await FarmerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    if (!['aadhaarDoc', 'passbookDoc', 'landRecordDoc'].includes(docType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    profile.documents[docType] = {
      fileName: fileName || `${docType}_document.pdf`,
      fileSize: fileSize || '',
      fileType: fileType || '',
      fileData: fileData || '',
      status: 'Uploaded',
      uploadedAt: new Date()
    };

    await profile.save();
    return res.status(200).json({
      success: true,
      message: `${docType} uploaded and saved successfully`,
      documents: profile.documents
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit all draft/unsubmitted crops in a specific mandal for official officer verification
// @route   POST /api/farmers/submit-mandal-registration
// @access  Private (FARMER)
export const submitMandalRegistration = async (req, res) => {
  try {
    const { mandal } = req.body;
    if (!mandal) {
      return res.status(400).json({ success: false, message: 'Mandal is required' });
    }

    const profile = await FarmerProfile.findOne({
      $or: [{ userId: req.user._id }, { _id: req.user._id }]
    });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    // 1. Find lands belonging to this mandal
    const farmerIdMatch = { $or: [{ farmerId: profile._id }, { farmerId: req.user._id }] };
    const lands = await Land.find({
      ...farmerIdMatch,
      mandal: new RegExp(`^${mandal}$`, 'i')
    });
    const landIds = lands.map(l => l._id);

    // 2. Check if registration deadline has passed for this mandal
    const deadlines = await getFarmerMandalDeadlines(profile, lands);
    const mDeadline = deadlines.find(d => d.mandal.toLowerCase() === mandal.toLowerCase());
    if (mDeadline && mDeadline.isDeadlinePassed) {
      return res.status(400).json({
        success: false,
        message: `The registration deadline for ${mandal} Mandal has expired on ${new Date(mDeadline.deadlineDate).toLocaleDateString()}. Submissions cannot be accepted after the deadline.`
      });
    }

    // 3. Validate mandatory government documents (3 required)
    const docsCheck = checkFarmerDocuments(profile);
    if (!docsCheck.valid) {
      return res.status(400).json({
        success: false,
        message: `Please upload all 3 mandatory verification documents (${docsCheck.missingDocs.join(', ')}) before submitting for verification.`
      });
    }

    // 4. Find all crops in this mandal that are DRAFT or RETURNED_FOR_CORRECTION
    const cropsToSubmit = await CropRegistration.find({
      ...farmerIdMatch,
      $or: [
        { mandal: new RegExp(`^${mandal}$`, 'i') },
        { landId: { $in: landIds } }
      ],
      status: { $in: ['DRAFT', 'RETURNED_FOR_CORRECTION'] }
    });

    if (cropsToSubmit.length === 0) {
      const alreadySubmitted = await CropRegistration.countDocuments({
        ...farmerIdMatch,
        $or: [
          { mandal: new RegExp(`^${mandal}$`, 'i') },
          { landId: { $in: landIds } }
        ],
        status: { $in: ['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED'] }
      });

      if (alreadySubmitted > 0) {
        return res.status(200).json({
          success: true,
          message: `All crop registrations for ${mandal} Mandal have already been submitted and are under official review.`,
          count: 0
        });
      }

      return res.status(400).json({
        success: false,
        message: `No crops found in ${mandal} Mandal to submit. Please add crops in Farm Records first.`
      });
    }

    // 5. Update all eligible crops to SUBMITTED with current timestamp
    const now = new Date();
    for (const crop of cropsToSubmit) {
      const wasReturned = crop.status === 'RETURNED_FOR_CORRECTION';
      crop.status = 'SUBMITTED';
      crop.submittedAt = now;
      await crop.save();

      await CropRegistrationHistory.create({
        registrationId: crop._id,
        action: wasReturned ? 'RESUBMITTED' : 'SUBMITTED',
        comment: wasReturned
          ? `Application corrected and resubmitted by farmer for ${mandal} Mandal verification`
          : `Official registration submitted by farmer for ${mandal} Mandal Agriculture Officer verification`,
        officerName: 'Farmer Self-Submission'
      });
    }

    profile.registrationStatus = 'UNDER_VERIFICATION';
    await profile.save();

    return res.status(200).json({
      success: true,
      message: `Successfully submitted ${cropsToSubmit.length} crop registration(s) in ${mandal} Mandal for Agriculture Officer verification!`,
      count: cropsToSubmit.length
    });
  } catch (error) {
    console.error('Submit mandal registration error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
