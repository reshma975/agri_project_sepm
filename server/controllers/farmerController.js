import { FarmerProfile } from '../models/FarmerProfile.js';
import { Land } from '../models/Land.js';
import { CropRegistration } from '../models/CropRegistration.js';
import { CropRegistrationHistory } from '../models/CropRegistrationHistory.js';
import { VerificationIssue } from '../models/VerificationIssue.js';
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

// Helper to resolve effective land status
const resolveLandStatus = (land, crops = [], openIssues = []) => {
  if (openIssues.length > 0 || land.overallVerificationStatus === 'RESUBMIT_NEEDED') {
    return 'RESUBMIT_NEEDED';
  }
  if (crops.some((c) => c.status === 'RETURNED_FOR_CORRECTION')) {
    return 'RESUBMIT_NEEDED';
  }
  if (land.overallVerificationStatus === 'VERIFIED') {
    return 'VERIFIED';
  }
  if (crops.length > 0 && crops.every((c) => c.status === 'VERIFIED')) {
    return 'VERIFIED';
  }
  if (land.overallVerificationStatus === 'REJECTED') {
    return 'REJECTED';
  }
  if (crops.length > 0 && crops.every((c) => c.status === 'REJECTED')) {
    return 'REJECTED';
  }
  if (
    land.overallVerificationStatus === 'SUBMITTED' ||
    land.overallVerificationStatus === 'UNDER_VERIFICATION' ||
    crops.some((c) => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status))
  ) {
    return 'PENDING_VERIFICATION';
  }
  return 'DRAFT';
};

// Helper to check deadlines strictly for mandals where the farmer owns land parcels
const getFarmerMandalDeadlines = async (profile, lands = []) => {
  if (!lands || lands.length === 0) {
    return [];
  }

  const mandalSet = new Set();
  lands.forEach(l => {
    if (l.mandal && l.mandal.trim()) {
      mandalSet.add(l.mandal.trim());
    }
  });

  if (mandalSet.size === 0) {
    return [];
  }

  const mandalDeadlines = [];
  const now = new Date();

  for (const mandal of mandalSet) {
    const landsInMandal = lands.filter(
      l => l.mandal && l.mandal.trim().toLowerCase() === mandal.toLowerCase()
    ).length;

    if (landsInMandal === 0) continue;

    const deadline = await RegistrationDeadline.findOne({
      mandal: new RegExp(`^${mandal}$`, 'i'),
      isActive: true
    }).sort({ createdAt: -1 });

    if (deadline) {
      const deadlineDate = new Date(deadline.deadlineDate);
      mandalDeadlines.push({
        mandal: deadline.mandal,
        district: deadline.district || profile?.district || 'Vijayawada',
        season: deadline.season || 'Kharif',
        year: deadline.year || new Date().getFullYear(),
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

// @desc    Get farmer registration deadline info
// @route   GET /api/farmers/deadline
// @access  Private (FARMER)
export const getFarmerDeadline = async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({
      $or: [{ userId: req.user._id }, { _id: req.user._id }]
    });
    const farmerMandal = profile ? profile.mandal : 'Penamaluru';

    const farmerIdMatch = profile ? { $or: [{ farmerId: profile._id }, { farmerId: req.user._id }] } : {};
    const lands = profile ? await Land.find(farmerIdMatch) : [];

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

// @desc    Get farmer lands (with attached crops, issues, and overallVerificationStatus)
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

    const farmerIdMatch = { $or: [{ farmerId: profile._id }, { farmerId: req.user._id }] };
    const lands = await Land.find(farmerIdMatch).sort({ createdAt: -1 });

    const allCrops = await CropRegistration.find(farmerIdMatch).sort({ createdAt: -1 });
    const allIssues = await VerificationIssue.find({ farmerId: profile._id }).sort({ createdAt: -1 });

    const enrichedLands = [];

    for (const land of lands) {
      if (!land.landId) {
        land.landId = `LND${Math.floor(10000 + Math.random() * 90000)}`;
        await land.save();
      }

      const linkedCrops = allCrops.filter(
        (c) =>
          (c.landId && c.landId.toString() === land._id.toString()) ||
          (c.surveyNumber && c.surveyNumber.trim().toLowerCase() === land.surveyNumber.trim().toLowerCase())
      );

      const linkedIssues = allIssues.filter(
        (i) => i.landId && i.landId.toString() === land._id.toString()
      );

      const effectiveStatus = resolveLandStatus(land, linkedCrops, linkedIssues.filter(i => i.status !== 'RESOLVED'));

      enrichedLands.push({
        ...land.toObject(),
        overallVerificationStatus: effectiveStatus,
        crops: linkedCrops,
        issues: linkedIssues,
        openIssues: linkedIssues.filter((i) => i.status === 'OPEN' || i.status === 'RESUBMITTED'),
        landIssues: linkedIssues.filter((i) => i.issueLevel === 'LAND' && (i.status === 'OPEN' || i.status === 'RESUBMITTED')),
        cropIssues: linkedIssues.filter((i) => i.issueLevel === 'CROP' && (i.status === 'OPEN' || i.status === 'RESUBMITTED')),
      });
    }

    return res.status(200).json({ success: true, lands: enrichedLands });
  } catch (error) {
    console.error('getFarmerLands error:', error);
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
      cultivatedArea,
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

      // Check existing crops on this land parcel to compute currently allocated area
      const parcelCrops = await CropRegistration.find({
        farmerId: profile._id,
        $or: [
          { landId: existingLand._id },
          { surveyNumber: targetSurvey }
        ],
        status: { $nin: ['REJECTED'] }
      });

      const alreadyAllocatedArea = parcelCrops.reduce((sum, c) => sum + (Number(c.cultivatedArea) || 0), 0);
      const totalParcelArea = existingLand.totalArea || Number(totalArea) || 1;
      const remainingArea = Math.max(0, totalParcelArea - alreadyAllocatedArea);

      if (remainingArea <= 0.001) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more crops to Survey No. ${targetSurvey}. All ${totalParcelArea} Acres are already allocated to existing crops (${parcelCrops.map(c => `${c.cropName}: ${c.cultivatedArea} Ac`).join(', ')}).`
        });
      }

      const requestedCultArea = Number(cultivatedArea) || remainingArea;

      if (alreadyAllocatedArea + requestedCultArea > totalParcelArea + 0.001) {
        return res.status(400).json({
          success: false,
          message: `Cannot allocate ${requestedCultArea} Acres. This ${totalParcelArea}-Acre parcel already has ${alreadyAllocatedArea.toFixed(1)} Acres allocated (${remainingArea.toFixed(1)} Acres available).`
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
        cultivatedArea: requestedCultArea,
        totalLandArea: totalParcelArea,
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
        landId: existingLand._id,
        action: 'DRAFT_RECORDED',
        comment: `New crop "${currentCrop.trim()}" recorded on Survey No. ${targetSurvey} (Not Submitted)`,
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
      overallVerificationStatus: 'DRAFT'
    });

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
        cultivatedArea: Number(cultivatedArea) || Number(totalArea) || 1,
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
        landId: land._id,
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

// @desc    Get crop registrations with optional year & status filter (with attached issues)
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

    const openIssues = await VerificationIssue.find({
      farmerId: profile._id,
      status: { $ne: 'RESOLVED' }
    });

    const enrichedCrops = crops.map((crop) => {
      const cid = crop._id.toString();
      const lid = crop.landId?._id ? crop.landId._id.toString() : crop.landId?.toString() || '';

      const cropSpecificIssues = openIssues.filter((i) => i.cropId && i.cropId.toString() === cid);
      const landLevelIssues = openIssues.filter((i) => i.issueLevel === 'LAND' && i.landId && i.landId.toString() === lid);

      return {
        ...crop.toObject(),
        cropIssues: cropSpecificIssues,
        landIssues: landLevelIssues,
        hasOpenIssue: cropSpecificIssues.length > 0,
      };
    });

    return res.status(200).json({ success: true, crops: enrichedCrops });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single crop registration by ID with history audit trail and verification issues
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

    const history = await CropRegistrationHistory.find({
      $or: [{ registrationId: crop._id }, { landId: crop.landId?._id }]
    }).sort({ timestamp: -1 });

    const issues = await VerificationIssue.find({
      $or: [
        { cropId: crop._id },
        { landId: crop.landId?._id, issueLevel: 'LAND' }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, crop, history, issues });
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

    if (!isDraft) {
      const deadlineCheck = await checkMandalDeadline(farmerMandal);
      if (deadlineCheck.passed) {
        return res.status(400).json({
          success: false,
          message: `The crop registration deadline for ${farmerMandal} closed on ${new Date(deadlineCheck.deadline.deadlineDate).toLocaleString()}. No new submissions can be accepted.`
        });
      }
    }

    const targetSurvey = (surveyNumber || '').trim();
    if (!targetSurvey) {
      return res.status(400).json({ success: false, message: 'Survey Number is required for land parcel identification' });
    }

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
        ownershipType: ownershipType || 'Owned',
        overallVerificationStatus: isDraft ? 'DRAFT' : 'SUBMITTED'
      });

      const allLands = await Land.find({ farmerId: profile._id });
      profile.totalLandArea = allLands.reduce((acc, curr) => acc + (curr.totalArea || 0), 0);
    }

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

    const existingParcelCrops = await CropRegistration.find({
      farmerId: profile._id,
      $or: [
        { landId: land._id },
        { surveyNumber: land.surveyNumber }
      ],
      status: { $nin: ['REJECTED'] }
    });
    const alreadyAllocated = existingParcelCrops.reduce((sum, c) => sum + (Number(c.cultivatedArea) || 0), 0);
    const newRequestedTotal = cropList.reduce((sum, item) => sum + (Number(item.cultivatedArea) || 0), 0);
    const totalParcelArea = land.totalArea || Number(totalLandArea) || 1;
    const remainingAvailable = Math.max(0, totalParcelArea - alreadyAllocated);

    if (alreadyAllocated + newRequestedTotal > totalParcelArea + 0.001) {
      return res.status(400).json({
        success: false,
        message: `Cannot allocate ${newRequestedTotal} Acres. This ${totalParcelArea}-Acre parcel already has ${alreadyAllocated.toFixed(1)} Acres allocated (${remainingAvailable.toFixed(1)} Acres available).`
      });
    }

    const createdCrops = [];
    const status = isDraft ? 'DRAFT' : 'SUBMITTED';

    for (const item of cropList) {
      if (!item.cropName || !item.cultivatedArea) continue;

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
        fertilizersUsed: item.fertilizersUsed || 'Urea, DAP',
        pesticidesUsed: item.pesticidesUsed || 'Neem Oil',
        expectedHarvest: item.expectedHarvest || '40 Quintals',
        status,
        submittedAt: isDraft ? null : new Date()
      });

      await CropRegistrationHistory.create({
        registrationId: crop._id,
        landId: land._id,
        action: isDraft ? 'DRAFT_RECORDED' : 'SUBMITTED',
        comment: isDraft
          ? `Draft crop "${item.cropName}" registered by farmer`
          : `Crop "${item.cropName}" submitted for officer verification`,
        officerName: isDraft ? 'Farmer Self-Service' : 'Farmer Self-Submission'
      });

      createdCrops.push(crop);
    }

    if (!isDraft) {
      land.overallVerificationStatus = 'SUBMITTED';
      land.submittedAt = new Date();
      await land.save();
    }

    return res.status(201).json({
      success: true,
      message: `${createdCrops.length} crop record(s) registered successfully on Survey No. ${land.surveyNumber}`,
      crops: createdCrops,
      land
    });
  } catch (error) {
    console.error('Register crop error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update crop (edit draft or resubmit returned application with issue resolution)
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

    if (isSubmitting) {
      const farmerMandal = crop.mandal || profile.mandal || 'Penamaluru';
      const deadlineCheck = await checkMandalDeadline(farmerMandal);
      if (deadlineCheck.passed) {
        return res.status(400).json({
          success: false,
          message: `The crop registration deadline for ${farmerMandal} closed on ${new Date(deadlineCheck.deadline.deadlineDate).toLocaleString()}. Resubmission is no longer accepted after the deadline.`
        });
      }
    }

    if (cropName !== undefined && cropName.trim()) crop.cropName = cropName.trim();
    if (cropCategory !== undefined) crop.cropCategory = cropCategory;
    if (surveyNumber !== undefined && surveyNumber.trim()) crop.surveyNumber = surveyNumber.trim();
    if (cultivatedArea !== undefined && !isNaN(Number(cultivatedArea))) {
      const newCultArea = Number(cultivatedArea);
      const totalParcelArea = crop.totalLandArea || 1;
      const otherCrops = await CropRegistration.find({
        _id: { $ne: crop._id },
        farmerId: profile._id,
        $or: [
          { landId: crop.landId },
          { surveyNumber: crop.surveyNumber }
        ],
        status: { $nin: ['REJECTED'] }
      });
      const otherAllocated = otherCrops.reduce((sum, c) => sum + (Number(c.cultivatedArea) || 0), 0);
      const availableArea = Math.max(0, totalParcelArea - otherAllocated);
      if (newCultArea + otherAllocated > totalParcelArea + 0.001) {
        return res.status(400).json({
          success: false,
          message: `Cannot allocate ${newCultArea} Acres. This ${totalParcelArea}-Acre parcel only has ${availableArea.toFixed(1)} Acres available (${otherAllocated.toFixed(1)} Acres already allocated to other crops).`
        });
      }
      crop.cultivatedArea = newCultArea;
    }
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
      crop.submittedAt = crop.submittedAt || new Date();

      // Update any open issues on this crop to RESUBMITTED
      await VerificationIssue.updateMany(
        { cropId: crop._id, status: 'OPEN' },
        { $set: { status: 'RESUBMITTED', resubmittedAt: new Date(), farmerComment: resubmitComment || 'Corrected by farmer' } }
      );

      // Check parent Land parcel: if all other issues on this parcel are resolved/resubmitted, set land to SUBMITTED
      if (crop.landId) {
        const remainingOpenIssues = await VerificationIssue.countDocuments({
          landId: crop.landId,
          status: 'OPEN'
        });
        if (remainingOpenIssues === 0) {
          await Land.findByIdAndUpdate(crop.landId, {
            $set: { overallVerificationStatus: 'SUBMITTED', submittedAt: new Date() }
          });
        }
      }

      await CropRegistrationHistory.create({
        registrationId: crop._id,
        landId: crop.landId,
        action: isReturned ? 'RESUBMITTED' : 'SUBMITTED',
        comment: isReturned
          ? (resubmitComment || 'Corrected and resubmitted by farmer for officer review')
          : (submitComment || 'Crop submitted digitally by farmer for officer verification'),
        officerName: isReturned ? 'Farmer Resubmission' : 'Farmer Self-Submission'
      });

      if (profile.registrationStatus !== 'VERIFIED') {
        profile.registrationStatus = 'UNDER_VERIFICATION';
        await profile.save();
      }
    } else if (isDraft) {
      await CropRegistrationHistory.create({
        registrationId: crop._id,
        landId: crop.landId,
        action: 'DRAFT_SAVED',
        comment: 'Draft details updated by farmer',
        officerName: 'Farmer Self-Submission'
      });
    } else {
      await CropRegistrationHistory.create({
        registrationId: crop._id,
        landId: crop.landId,
        action: 'UPDATED',
        comment: 'Crop details updated by farmer',
        officerName: 'Farmer Self-Submission'
      });
    }

    await crop.save();
    await crop.populate('landId');

    return res.status(200).json({
      success: true,
      message: isSubmitting
        ? (isDraft ? 'Crop submitted successfully for officer verification!' : 'Application resubmitted successfully with corrections!')
        : 'Crop details updated successfully!',
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

    // Mark any open land/document level verification issues as RESUBMITTED
    await VerificationIssue.updateMany(
      { farmerId: profile._id, issueLevel: 'LAND', status: 'OPEN' },
      { $set: { status: 'RESUBMITTED', resubmittedAt: new Date(), farmerComment: `Uploaded new ${docType}` } }
    );

    return res.status(200).json({
      success: true,
      message: `${docType} uploaded and saved successfully`,
      documents: profile.documents
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit all unsubmitted crops and lands in a mandal for official officer verification
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

    // 1. Find lands in this mandal
    const farmerIdMatch = { $or: [{ farmerId: profile._id }, { farmerId: req.user._id }] };
    const lands = await Land.find({
      ...farmerIdMatch,
      mandal: new RegExp(`^${mandal}$`, 'i')
    });
    const landIds = lands.map(l => l._id);

    // 2. Check deadline
    const deadlines = await getFarmerMandalDeadlines(profile, lands);
    const mDeadline = deadlines.find(d => d.mandal.toLowerCase() === mandal.toLowerCase());
    if (mDeadline && mDeadline.isDeadlinePassed) {
      return res.status(400).json({
        success: false,
        message: `The registration deadline for ${mandal} Mandal has expired on ${new Date(mDeadline.deadlineDate).toLocaleDateString()}. Submissions cannot be accepted after the deadline.`
      });
    }

    // 3. Validate mandatory documents
    const docsCheck = checkFarmerDocuments(profile);
    if (!docsCheck.valid) {
      return res.status(400).json({
        success: false,
        message: `Please upload all 3 mandatory verification documents (${docsCheck.missingDocs.join(', ')}) before submitting for verification.`,
        missingDocs: docsCheck.missingDocs
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

    // 5. Update all eligible crops to SUBMITTED
    const now = new Date();
    for (const crop of cropsToSubmit) {
      const wasReturned = crop.status === 'RETURNED_FOR_CORRECTION';
      crop.status = 'SUBMITTED';
      crop.submittedAt = now;
      await crop.save();

      await CropRegistrationHistory.create({
        registrationId: crop._id,
        landId: crop.landId,
        action: wasReturned ? 'RESUBMITTED' : 'SUBMITTED',
        comment: wasReturned
          ? `Application corrected and resubmitted by farmer for ${mandal} Mandal verification`
          : `Official registration submitted by farmer for ${mandal} Mandal Agriculture Officer verification`,
        officerName: 'Farmer Self-Submission'
      });
    }

    // 6. Update all Lands in this mandal to SUBMITTED
    await Land.updateMany(
      { _id: { $in: landIds } },
      { $set: { overallVerificationStatus: 'SUBMITTED', submittedAt: now } }
    );

    // 7. Mark open issues as RESUBMITTED
    await VerificationIssue.updateMany(
      { landId: { $in: landIds }, status: 'OPEN' },
      { $set: { status: 'RESUBMITTED', resubmittedAt: now, farmerComment: 'Resubmitted with mandal application' } }
    );

    profile.registrationStatus = 'UNDER_VERIFICATION';
    await profile.save();

    return res.status(200).json({
      success: true,
      message: `Successfully submitted ${cropsToSubmit.length} crop registration(s) across ${lands.length} land parcel(s) in ${mandal} Mandal for Agriculture Officer verification!`,
      count: cropsToSubmit.length,
      parcelsCount: lands.length
    });
  } catch (error) {
    console.error('Submit mandal registration error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
