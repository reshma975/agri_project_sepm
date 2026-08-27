import mongoose from 'mongoose';
import { OfficerProfile } from '../models/OfficerProfile.js';
import { CropRegistration } from '../models/CropRegistration.js';
import { CropRegistrationHistory } from '../models/CropRegistrationHistory.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { Land } from '../models/Land.js';
import { User } from '../models/User.js';
import { RegistrationDeadline } from '../models/RegistrationDeadline.js';

// Helper to extract clean mandal from officer profile
const getOfficerMandal = (officer) => {
  if (officer.mandal && officer.mandal.trim()) {
    return officer.mandal.trim();
  }
  if (officer.assignedArea && officer.assignedArea.includes('Mandal')) {
    return officer.assignedArea.split('Mandal')[0].trim();
  }
  return 'Penamaluru';
};

// @desc    Get officer dashboard summary, mandal deadline, and pending verifications queue (grouped by farmer & individual crops)
// @route   GET /api/officer/dashboard
// @access  Private (OFFICER)
export const getOfficerDashboard = async (req, res) => {
  try {
    let officer = await OfficerProfile.findOne({ userId: req.user._id });
    if (!officer) {
      officer = await OfficerProfile.create({
        userId: req.user._id,
        officerId: `AGR-OFC-${Math.floor(1000 + Math.random() * 9000)}`,
        assignedArea: 'Penamaluru Mandal, Krishna District',
        mandal: 'Penamaluru',
        district: 'Vijayawada'
      });
    }

    const officerMandal = getOfficerMandal(officer);

    // Find lands situated in officer's mandal
    const landsInMandal = await Land.find({
      mandal: new RegExp(`^${officerMandal}$`, 'i')
    });
    const landIdsInMandal = landsInMandal.map((l) => l._id);

    // Find all farmers in officer's mandal (case-insensitive regex)
    const farmersInMandal = await FarmerProfile.find({
      mandal: new RegExp(`^${officerMandal}$`, 'i')
    }).populate('userId', 'name email phone username avatar');

    const farmerIds = farmersInMandal.map((f) => f._id);

    // Mandal crop filter: checks crop location mandal, land parcel mandal, or farmer profile mandal
    const mandalCropFilter = {
      $or: [
        { mandal: new RegExp(`^${officerMandal}$`, 'i') },
        { landId: { $in: landIdsInMandal } },
        { farmerId: { $in: farmerIds } }
      ]
    };

    const pendingQuery = {
      ...mandalCropFilter,
      status: { $in: ['SUBMITTED', 'UNDER_VERIFICATION'] }
    };

    const verifiedQuery = { ...mandalCropFilter, status: 'VERIFIED' };
    const returnedQuery = { ...mandalCropFilter, status: 'RETURNED_FOR_CORRECTION' };
    const rejectedQuery = { ...mandalCropFilter, status: 'REJECTED' };

    const [pendingCount, verifiedCount, returnedCount, rejectedCount] = await Promise.all([
      CropRegistration.countDocuments(pendingQuery),
      CropRegistration.countDocuments(verifiedQuery),
      CropRegistration.countDocuments(returnedQuery),
      CropRegistration.countDocuments(rejectedQuery),
    ]);

    // Fetch pending list populated with farmer & land details
    const pendingApplications = await CropRegistration.find(pendingQuery)
      .populate({
        path: 'farmerId',
        populate: { path: 'userId', select: 'name email phone username avatar' }
      })
      .populate('landId')
      .sort({ submittedAt: -1, createdAt: -1 })
      .limit(50);

    // Group pending applications by Farmer for farmer-centric verification
    const farmerMap = {};

    for (const app of pendingApplications) {
      const fId = app.farmerId?._id?.toString() || 'unknown';
      if (!farmerMap[fId]) {
        const farmerDoc = app.farmerId;
        const docs = farmerDoc?.documents || {};
        const hasAadhaar = Boolean(docs.aadhaarDoc?.fileName);
        const hasPassbook = Boolean(docs.passbookDoc?.fileName);
        const hasLandRecord = Boolean(docs.landRecordDoc?.fileName);

        farmerMap[fId] = {
          farmerId: farmerDoc?._id,
          farmerCode: farmerDoc?.farmerId || 'FMR-ID',
          user: farmerDoc?.userId || {},
          profile: farmerDoc,
          village: farmerDoc?.village || 'Village',
          mandal: farmerDoc?.mandal || officerMandal,
          district: farmerDoc?.district || 'Vijayawada',
          registrationStatus: farmerDoc?.registrationStatus || 'UNVERIFIED',
          documents: docs,
          documentsStatus: {
            aadhaar: hasAadhaar,
            passbook: hasPassbook,
            landRecord: hasLandRecord,
            allUploaded: hasAadhaar && hasPassbook && hasLandRecord
          },
          crops: []
        };
      }
      farmerMap[fId].crops.push(app);
    }

    const farmerApplications = Object.values(farmerMap);

    // Fetch active registration deadline for this mandal
    let deadline = await RegistrationDeadline.findOne({
      mandal: new RegExp(`^${officerMandal}$`, 'i'),
      isActive: true
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      officer,
      mandal: officerMandal,
      deadline,
      stats: {
        pending: pendingCount,
        verified: verifiedCount,
        returned: returnedCount,
        rejected: rejectedCount,
        totalFarmersInMandal: farmersInMandal.length,
        totalReviewed: verifiedCount + returnedCount + rejectedCount
      },
      pendingApplications,
      farmerApplications
    });
  } catch (error) {
    console.error('getOfficerDashboard error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get verifications list filtered by officer's mandal (status, year, search)
// @route   GET /api/officer/verifications
// @access  Private (OFFICER)
export const getOfficerVerifications = async (req, res) => {
  try {
    const officer = await OfficerProfile.findOne({ userId: req.user._id });
    const officerMandal = officer ? getOfficerMandal(officer) : 'Penamaluru';

    // Find lands situated in this mandal
    const landsInMandal = await Land.find({
      mandal: new RegExp(`^${officerMandal}$`, 'i')
    });
    const landIdsInMandal = landsInMandal.map((l) => l._id);

    // Find farmers strictly in this mandal
    const farmersInMandal = await FarmerProfile.find({
      mandal: new RegExp(`^${officerMandal}$`, 'i')
    });
    const farmerIds = farmersInMandal.map((f) => f._id);

    const { status, year, search } = req.query;
    const query = {
      $or: [
        { mandal: new RegExp(`^${officerMandal}$`, 'i') },
        { landId: { $in: landIdsInMandal } },
        { farmerId: { $in: farmerIds } }
      ]
    };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (year && year !== 'All') {
      query.year = Number(year);
    }

    let applications = await CropRegistration.find(query)
      .populate({
        path: 'farmerId',
        populate: { path: 'userId', select: 'name email phone username avatar' }
      })
      .populate('landId')
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      applications = applications.filter((app) => {
        const farmerName = app.farmerId?.userId?.name?.toLowerCase() || '';
        const farmerId = app.farmerId?.farmerId?.toLowerCase() || '';
        const cropName = app.cropName?.toLowerCase() || '';
        const survey = app.surveyNumber?.toLowerCase() || '';
        const village = app.farmerId?.village?.toLowerCase() || '';
        return (
          farmerName.includes(q) ||
          farmerId.includes(q) ||
          cropName.includes(q) ||
          survey.includes(q) ||
          village.includes(q)
        );
      });
    }

    return res.status(200).json({
      success: true,
      mandal: officerMandal,
      count: applications.length,
      applications
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed crop application for officer review
// @route   GET /api/officer/crops/:id
// @access  Private (OFFICER)
export const getCropApplicationDetails = async (req, res) => {
  try {
    const crop = await CropRegistration.findById(req.params.id)
      .populate({
        path: 'farmerId',
        populate: { path: 'userId', select: 'name email phone username avatar' }
      })
      .populate('landId')
      .populate({
        path: 'reviewedBy',
        populate: { path: 'userId', select: 'name username' }
      });

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop registration application not found' });
    }

    const history = await CropRegistrationHistory.find({ registrationId: crop._id }).sort({ timestamp: -1 });

    return res.status(200).json({ success: true, crop, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complete Farmer Dossier (Farmer Profile, Documents, Lands, all Crops) for Farmer-centric verification
// @route   GET /api/officer/farmers/:id/dossier
// @access  Private (OFFICER)
export const getFarmerDossier = async (req, res) => {
  try {
    const rawId = req.params.id;
    let profile = null;
    if (mongoose.isValidObjectId(rawId)) {
      profile = await FarmerProfile.findById(rawId).populate(
        'userId',
        'name email phone username avatar'
      );
    }
    if (!profile) {
      profile = await FarmerProfile.findOne({ farmerId: rawId }).populate(
        'userId',
        'name email phone username avatar'
      );
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    const lands = await Land.find({ farmerId: profile._id }).sort({ createdAt: -1 });
    const crops = await CropRegistration.find({ farmerId: profile._id })
      .populate('landId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      profile,
      lands,
      crops,
      documents: profile.documents
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify crop registration
// @route   PUT /api/officer/crops/:id/verify
// @access  Private (OFFICER)
export const verifyCrop = async (req, res) => {
  try {
    const crop = await CropRegistration.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop registration not found' });
    }

    const officer = await OfficerProfile.findOne({ userId: req.user._id });

    crop.status = 'VERIFIED';
    crop.reviewedBy = officer ? officer._id : null;
    crop.reviewedAt = new Date();
    crop.officerComment = req.body.comment || 'Verified and approved according to agricultural survey standards.';
    await crop.save();

    // Update farmer profile registration status
    const farmer = await FarmerProfile.findById(crop.farmerId);
    if (farmer) {
      farmer.registrationStatus = 'VERIFIED';
      await farmer.save();
    }

    // Add to history
    await CropRegistrationHistory.create({
      registrationId: crop._id,
      officerId: officer ? officer._id : null,
      officerName: req.user.name || 'Govt Agriculture Officer',
      action: 'VERIFIED',
      comment: crop.officerComment
    });

    return res.status(200).json({
      success: true,
      message: 'Crop registration verified successfully',
      crop
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Return crop registration for correction / resubmission
// @route   PUT /api/officer/crops/:id/return
// @access  Private (OFFICER)
export const returnCropForCorrection = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a reason for returning the application for resubmission' });
    }

    const crop = await CropRegistration.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop registration not found' });
    }

    const officer = await OfficerProfile.findOne({ userId: req.user._id });

    crop.status = 'RETURNED_FOR_CORRECTION';
    crop.reviewedBy = officer ? officer._id : null;
    crop.reviewedAt = new Date();
    crop.officerComment = reason;
    await crop.save();

    // Update farmer profile registration status
    const farmer = await FarmerProfile.findById(crop.farmerId);
    if (farmer && farmer.registrationStatus !== 'VERIFIED') {
      farmer.registrationStatus = 'RETURNED_FOR_CORRECTION';
      await farmer.save();
    }

    // Add to history
    await CropRegistrationHistory.create({
      registrationId: crop._id,
      officerId: officer ? officer._id : null,
      officerName: req.user.name || 'Govt Agriculture Officer',
      action: 'RETURNED_FOR_CORRECTION',
      comment: reason
    });

    return res.status(200).json({
      success: true,
      message: 'Crop registration returned for correction',
      crop
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject crop registration
// @route   PUT /api/officer/crops/:id/reject
// @access  Private (OFFICER)
export const rejectCrop = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a reason for rejecting the application' });
    }

    const crop = await CropRegistration.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop registration not found' });
    }

    const officer = await OfficerProfile.findOne({ userId: req.user._id });

    crop.status = 'REJECTED';
    crop.reviewedBy = officer ? officer._id : null;
    crop.reviewedAt = new Date();
    crop.officerComment = reason;
    await crop.save();

    // Add to history
    await CropRegistrationHistory.create({
      registrationId: crop._id,
      officerId: officer ? officer._id : null,
      officerName: req.user.name || 'Govt Agriculture Officer',
      action: 'REJECTED',
      comment: reason
    });

    return res.status(200).json({
      success: true,
      message: 'Application rejected',
      crop
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Batch verify all pending crop applications for a farmer
// @route   PUT /api/officer/farmers/:id/verify
// @access  Private (OFFICER)
export const verifyFarmerDossier = async (req, res) => {
  try {
    const rawId = req.params.id;
    let farmer = null;
    if (mongoose.isValidObjectId(rawId)) {
      farmer = await FarmerProfile.findById(rawId);
    }
    if (!farmer) {
      farmer = await FarmerProfile.findOne({ farmerId: rawId });
    }

    const targetFarmerId = farmer ? farmer._id : rawId;
    const officer = await OfficerProfile.findOne({ userId: req.user._id });
    const comment = req.body.comment || 'Verified and approved according to agricultural survey standards.';

    const pendingCrops = await CropRegistration.find({
      farmerId: targetFarmerId,
      status: { $in: ['SUBMITTED', 'UNDER_VERIFICATION', 'RETURNED_FOR_CORRECTION'] }
    });

    for (const crop of pendingCrops) {
      crop.status = 'VERIFIED';
      crop.reviewedBy = officer ? officer._id : null;
      crop.reviewedAt = new Date();
      crop.officerComment = comment;
      await crop.save();

      await CropRegistrationHistory.create({
        registrationId: crop._id,
        officerId: officer ? officer._id : null,
        officerName: req.user.name || 'Govt Agriculture Officer',
        action: 'VERIFIED',
        comment
      });
    }

    if (farmer) {
      farmer.registrationStatus = 'VERIFIED';
      await farmer.save();
    }

    return res.status(200).json({
      success: true,
      message: `Successfully verified and approved ${pendingCrops.length} crop record(s) for this farmer`,
      verifiedCount: pendingCrops.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Batch return all pending crop applications for a farmer for correction / resubmission
// @route   PUT /api/officer/farmers/:id/return
// @access  Private (OFFICER)
export const returnFarmerDossier = async (req, res) => {
  try {
    const rawId = req.params.id;
    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a reason/clarification for the farmer' });
    }

    let farmer = null;
    if (mongoose.isValidObjectId(rawId)) {
      farmer = await FarmerProfile.findById(rawId);
    }
    if (!farmer) {
      farmer = await FarmerProfile.findOne({ farmerId: rawId });
    }

    const targetFarmerId = farmer ? farmer._id : rawId;
    const officer = await OfficerProfile.findOne({ userId: req.user._id });

    const pendingCrops = await CropRegistration.find({
      farmerId: targetFarmerId,
      status: { $in: ['SUBMITTED', 'UNDER_VERIFICATION'] }
    });

    for (const crop of pendingCrops) {
      crop.status = 'RETURNED_FOR_CORRECTION';
      crop.reviewedBy = officer ? officer._id : null;
      crop.reviewedAt = new Date();
      crop.officerComment = reason;
      await crop.save();

      await CropRegistrationHistory.create({
        registrationId: crop._id,
        officerId: officer ? officer._id : null,
        officerName: req.user.name || 'Govt Agriculture Officer',
        action: 'RETURNED_FOR_CORRECTION',
        comment: reason
      });
    }

    if (farmer && farmer.registrationStatus !== 'VERIFIED') {
      farmer.registrationStatus = 'RETURNED_FOR_CORRECTION';
      await farmer.save();
    }

    return res.status(200).json({
      success: true,
      message: `Returned ${pendingCrops.length} crop record(s) for correction & resubmission`,
      returnedCount: pendingCrops.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active registration deadline for officer's mandal
// @route   GET /api/officer/deadline
// @access  Private (OFFICER)
export const getMandalDeadline = async (req, res) => {
  try {
    const officer = await OfficerProfile.findOne({ userId: req.user._id });
    const officerMandal = officer ? getOfficerMandal(officer) : 'Penamaluru';

    const deadline = await RegistrationDeadline.findOne({
      mandal: new RegExp(`^${officerMandal}$`, 'i'),
      isActive: true
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      mandal: officerMandal,
      deadline
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set / Update registration deadline for officer's mandal
// @route   POST /api/officer/deadline
// @access  Private (OFFICER)
export const setMandalDeadline = async (req, res) => {
  try {
    const { deadlineDate, season, year, description, mandal: customMandal } = req.body;

    if (!deadlineDate) {
      return res.status(400).json({ success: false, message: 'Please specify a deadline date and time' });
    }

    const officer = await OfficerProfile.findOne({ userId: req.user._id });
    const officerMandal = customMandal || (officer ? getOfficerMandal(officer) : 'Penamaluru');

    // Deactivate previous deadlines for this mandal
    await RegistrationDeadline.updateMany(
      { mandal: new RegExp(`^${officerMandal}$`, 'i') },
      { $set: { isActive: false } }
    );

    const newDeadline = await RegistrationDeadline.create({
      mandal: officerMandal,
      district: officer?.district || 'Vijayawada',
      season: season || 'Kharif',
      year: year ? Number(year) : new Date().getFullYear(),
      deadlineDate: new Date(deadlineDate),
      description: description || `Crop registration deadline for ${officerMandal} Mandal set by Agriculture Officer.`,
      setByOfficer: officer ? officer._id : null,
      officerName: req.user.name || 'Govt Agriculture Officer',
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: `Crop registration deadline for ${officerMandal} Mandal set to ${new Date(deadlineDate).toLocaleString()}`,
      deadline: newDeadline
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search farmers across user details, farmer IDs, land survey numbers, and crops
// @route   GET /api/officer/farmers/search
// @access  Private (OFFICER)
export const searchFarmers = async (req, res) => {
  try {
    const officer = await OfficerProfile.findOne({ userId: req.user._id });
    const officerMandal = officer ? getOfficerMandal(officer) : 'Penamaluru';

    const { query } = req.query;
    if (!query) {
      return res.status(200).json({ success: true, mandal: officerMandal, results: [] });
    }

    const q = query.trim();

    // 1. Find users matching name, phone, email, or username
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } }
      ]
    }).select('name email phone username avatar');

    const userIds = users.map((u) => u._id);

    // 2. Find lands matching query (survey number, village, etc.)
    const matchingLands = await Land.find({
      $or: [
        { surveyNumber: { $regex: q, $options: 'i' } },
        { village: { $regex: q, $options: 'i' } },
        { mandal: { $regex: q, $options: 'i' } },
        { landId: { $regex: q, $options: 'i' } }
      ]
    });
    const landFarmerIds = matchingLands.map((l) => l.farmerId);

    // 3. Find crops matching query (crop name, registration ID, etc.)
    const matchingCrops = await CropRegistration.find({
      $or: [
        { cropName: { $regex: q, $options: 'i' } },
        { registrationId: { $regex: q, $options: 'i' } },
        { surveyNumber: { $regex: q, $options: 'i' } }
      ]
    });
    const cropFarmerIds = matchingCrops.map((c) => c.farmerId);

    // 4. Find farmer profiles matching query directly or linked to matching users/lands/crops
    const candidateProfiles = await FarmerProfile.find({
      $or: [
        { farmerId: { $regex: q, $options: 'i' } },
        { village: { $regex: q, $options: 'i' } },
        { mandal: { $regex: q, $options: 'i' } },
        { userId: { $in: userIds } },
        { _id: { $in: [...landFarmerIds, ...cropFarmerIds] } }
      ]
    }).populate('userId', 'name email phone username avatar');

    // Also auto-link any user matches that might not have a profile yet
    for (const u of users) {
      if (!candidateProfiles.some((p) => p.userId?._id?.toString() === u._id.toString())) {
        let p = await FarmerProfile.findOne({ userId: u._id }).populate('userId', 'name email phone username avatar');
        if (!p) {
          p = await FarmerProfile.create({
            userId: u._id,
            farmerId: `FMR${Math.floor(100000 + Math.random() * 900000)}`,
            village: 'Kankipadu',
            mandal: 'Penamaluru',
            district: 'Vijayawada',
            state: 'Andhra Pradesh'
          });
          p = await FarmerProfile.findById(p._id).populate('userId', 'name email phone username avatar');
        }
        if (p) candidateProfiles.push(p);
      }
    }

    // 5. Aggregate land and crop counts for each profile
    const results = await Promise.all(
      candidateProfiles.map(async (profile) => {
        const farmerIdMatch = { $or: [{ farmerId: profile._id }, { farmerId: profile.userId?._id }] };
        const lands = await Land.find(farmerIdMatch).sort({ createdAt: -1 });
        const crops = await CropRegistration.find(farmerIdMatch).sort({ createdAt: -1 });

        return {
          profile,
          lands,
          crops,
          totalCrops: crops.length,
          verifiedCrops: crops.filter((c) => c.status === 'VERIFIED').length,
          pendingCrops: crops.filter((c) => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status)).length
        };
      })
    );

    return res.status(200).json({
      success: true,
      mandal: officerMandal,
      count: results.length,
      results
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export verified crops report data filtered by officer's mandal
// @route   GET /api/officer/export
// @access  Private (OFFICER)
export const exportVerifiedReport = async (req, res) => {
  try {
    const officer = await OfficerProfile.findOne({ userId: req.user._id });
    const officerMandal = officer ? getOfficerMandal(officer) : 'Penamaluru';

    const farmersInMandal = await FarmerProfile.find({
      mandal: new RegExp(`^${officerMandal}$`, 'i')
    });
    const farmerIds = farmersInMandal.map((f) => f._id);

    const { year } = req.query;
    const query = {
      status: 'VERIFIED',
      farmerId: { $in: farmerIds }
    };

    if (year && year !== 'All') {
      query.year = Number(year);
    }

    const verified = await CropRegistration.find(query)
      .populate({
        path: 'farmerId',
        populate: { path: 'userId', select: 'name phone email' }
      })
      .populate('landId');

    const csvData = verified.map((v) => ({
      registrationId: v.registrationId,
      farmerId: v.farmerId?.farmerId,
      farmerName: v.farmerId?.userId?.name,
      contact: v.farmerId?.userId?.phone,
      village: v.farmerId?.village,
      mandal: v.farmerId?.mandal || officerMandal,
      district: v.farmerId?.district,
      surveyNumber: v.surveyNumber,
      cropName: v.cropName,
      season: v.season,
      year: v.year,
      cultivatedArea: `${v.cultivatedArea} ${v.areaUnit}`,
      irrigation: v.irrigationType,
      status: v.status,
      verifiedDate: v.reviewedAt ? new Date(v.reviewedAt).toLocaleDateString() : ''
    }));

    return res.status(200).json({
      success: true,
      mandal: officerMandal,
      count: csvData.length,
      data: csvData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
