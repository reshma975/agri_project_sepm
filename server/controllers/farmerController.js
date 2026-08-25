import { FarmerProfile } from '../models/FarmerProfile.js';
import { Land } from '../models/Land.js';
import { CropRegistration } from '../models/CropRegistration.js';
import { CropRegistrationHistory } from '../models/CropRegistrationHistory.js';
import { User } from '../models/User.js';

// @desc    Get farmer profile details & stats
// @route   GET /api/farmers/profile
// @access  Private (FARMER)
export const getFarmerProfile = async (req, res) => {
  try {
    let profile = await FarmerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await FarmerProfile.create({
        userId: req.user._id,
        farmerId: `FMR${Math.floor(100000 + Math.random() * 900000)}`,
        district: 'Vijayawada',
        state: 'Andhra Pradesh'
      });
    }

    const lands = await Land.find({ farmerId: profile._id });
    const cropCount = await CropRegistration.countDocuments({ farmerId: profile._id });
    const verifiedCropCount = await CropRegistration.countDocuments({
      farmerId: profile._id,
      status: 'VERIFIED'
    });
    const pendingCropCount = await CropRegistration.countDocuments({
      farmerId: profile._id,
      status: { $in: ['SUBMITTED', 'UNDER_VERIFICATION'] }
    });

    return res.status(200).json({
      success: true,
      profile,
      lands,
      stats: {
        totalLands: lands.length,
        totalCrops: cropCount,
        verifiedCrops: verifiedCropCount,
        pendingCrops: pendingCropCount
      }
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
    const profile = await FarmerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    const lands = await Land.find({ farmerId: profile._id }).sort({ createdAt: -1 });
    
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

// @desc    Create new land parcel
// @route   POST /api/farmers/lands
// @access  Private (FARMER)
export const createLand = async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
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

    // Check if this land parcel survey number already exists for this farmer
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

      // Register the new crop on this existing land parcel
      const registeredCrop = await CropRegistration.create({
        farmerId: profile._id,
        landId: existingLand._id,
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
        status: 'SUBMITTED',
        submittedAt: new Date()
      });

      await CropRegistrationHistory.create({
        registrationId: registeredCrop._id,
        action: 'SUBMITTED',
        comment: `New crop "${currentCrop.trim()}" added to Survey No. ${targetSurvey}`,
        officerName: 'Farmer Self-Submission'
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
      village: village || profile.village || 'Vijayawada',
      mandal: mandal || profile.mandal || '',
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
      registeredCrop = await CropRegistration.create({
        farmerId: profile._id,
        landId: land._id,
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
        status: 'SUBMITTED',
        submittedAt: new Date()
      });

      await CropRegistrationHistory.create({
        registrationId: registeredCrop._id,
        action: 'SUBMITTED',
        comment: `Crop recorded during cadastral land parcel registration (Duration: ${estimatedDurationMonths ? estimatedDurationMonths + ' Months' : 'Seasonal'})`,
        officerName: 'Farmer Self-Submission'
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
    const profile = await FarmerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    const { year, status } = req.query;
    const filter = { farmerId: profile._id };

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
        farmerId: `FMR${Math.floor(100000 + Math.random() * 900000)}`
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
      // Single crop fallback properties
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
        village: village || profile.village || 'Vijayawada',
        mandal: mandal || profile.mandal || '',
        district: district || profile.district || 'Vijayawada',
        totalArea: Number(totalLandArea) || Number(cultivatedArea) || 1,
        areaUnit: areaUnit || 'Acres',
        ownershipType: ownershipType || 'Owned'
      });

      // Update total land holding on farmer profile
      const allLands = await Land.find({ farmerId: profile._id });
      profile.totalLandArea = allLands.reduce((acc, curr) => acc + (curr.totalArea || 0), 0);
    }

    // Normalize crops list (supports both array of crops and single crop payload)
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

    profile.registrationStatus = 'UNDER_VERIFICATION';
    await profile.save();

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

// @desc    Update crop (e.g. edit draft or returned application)
// @route   PUT /api/farmers/crops/:id
// @access  Private (FARMER)
export const updateCrop = async (req, res) => {
  try {
    const crop = await CropRegistration.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop registration not found' });
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

    const isDraft = crop.status === 'DRAFT';
    const isSubmitting = submit || resubmit;

    if (isSubmitting) {
      crop.status = 'SUBMITTED';
      crop.submittedAt = new Date();

      await CropRegistrationHistory.create({
        registrationId: crop._id,
        action: isDraft ? 'SUBMITTED' : 'RESUBMITTED',
        comment: isDraft
          ? (submitComment || 'Draft submitted digitally by farmer for officer verification')
          : (resubmitComment || 'Corrected and resubmitted by farmer'),
        officerName: isDraft ? 'Farmer Self-Submission' : 'Farmer Resubmission'
      });

      // Update farmer profile registration status
      const profile = await FarmerProfile.findOne({ userId: req.user._id });
      if (profile && profile.registrationStatus !== 'VERIFIED') {
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
      ? (isDraft ? 'Crop submitted successfully for officer verification!' : 'Application resubmitted successfully!')
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
    const { docType, fileName, fileSize, fileType, fileData } = req.body; // docType: 'aadhaarDoc' | 'passbookDoc' | 'landRecordDoc'

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
      message: `${docType} uploaded and verified successfully`,
      documents: profile.documents
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
