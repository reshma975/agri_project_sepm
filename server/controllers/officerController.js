import { OfficerProfile } from '../models/OfficerProfile.js';
import { CropRegistration } from '../models/CropRegistration.js';
import { CropRegistrationHistory } from '../models/CropRegistrationHistory.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { Land } from '../models/Land.js';
import { User } from '../models/User.js';

// @desc    Get officer dashboard summary & pending verifications queue
// @route   GET /api/officer/dashboard
// @access  Private (OFFICER)
export const getOfficerDashboard = async (req, res) => {
  try {
    let officer = await OfficerProfile.findOne({ userId: req.user._id });
    if (!officer) {
      officer = await OfficerProfile.create({
        userId: req.user._id,
        officerId: `AGR-OFC-${Math.floor(1000 + Math.random() * 9000)}`,
        assignedArea: 'Vijayawada Mandal, Krishna District',
        district: 'Vijayawada'
      });
    }

    const { filterArea } = req.query; // 'assigned' or 'all'

    const pendingQuery = {
      status: { $in: ['SUBMITTED', 'UNDER_VERIFICATION'] }
    };

    const verifiedQuery = { status: 'VERIFIED' };
    const returnedQuery = { status: 'RETURNED_FOR_CORRECTION' };
    const rejectedQuery = { status: 'REJECTED' };

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
        populate: { path: 'userId', select: 'name email phone username' }
      })
      .populate('landId')
      .sort({ submittedAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      officer,
      stats: {
        pending: pendingCount,
        verified: verifiedCount,
        returned: returnedCount,
        rejected: rejectedCount,
        totalReviewed: verifiedCount + returnedCount + rejectedCount
      },
      pendingApplications
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get verifications list with filters (status, area, search, year)
// @route   GET /api/officer/verifications
// @access  Private (OFFICER)
export const getOfficerVerifications = async (req, res) => {
  try {
    const { status, year, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (year && year !== 'All') {
      query.year = Number(year);
    }

    let applications = await CropRegistration.find(query)
      .populate({
        path: 'farmerId',
        populate: { path: 'userId', select: 'name email phone username' }
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
        return farmerName.includes(q) || farmerId.includes(q) || cropName.includes(q) || survey.includes(q);
      });
    }

    return res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed application for officer review
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

// @desc    Return crop registration for correction
// @route   PUT /api/officer/crops/:id/return
// @access  Private (OFFICER)
export const returnCropForCorrection = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a reason for returning the application' });
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

    // Update farmer profile status
    const farmer = await FarmerProfile.findById(crop.farmerId);
    if (farmer) {
      farmer.registrationStatus = 'UNVERIFIED';
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
      message: 'Application returned for correction with note to farmer',
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

// @desc    Search farmers by Farmer ID, Name, Phone, or Village
// @route   GET /api/officer/farmers/search
// @access  Private (OFFICER)
export const searchFarmers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(200).json({ success: true, results: [] });
    }

    const q = query.trim();

    // Find users matching name, phone, or email that possess the FARMER role
    const users = await User.find({
      $and: [
        { $or: [{ roles: 'FARMER' }, { role: 'FARMER' }] },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { phone: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { username: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).select('name email phone username avatar');


    const userIds = users.map(u => u._id);

    // Find farmer profiles matching farmerId, village, or userIds
    const profiles = await FarmerProfile.find({
      $or: [
        { farmerId: { $regex: q, $options: 'i' } },
        { village: { $regex: q, $options: 'i' } },
        { district: { $regex: q, $options: 'i' } },
        { userId: { $in: userIds } }
      ]
    }).populate('userId', 'name email phone username avatar');

    // Aggregate land and crop counts for each profile
    const results = await Promise.all(
      profiles.map(async (profile) => {
        const lands = await Land.find({ farmerId: profile._id });
        const crops = await CropRegistration.find({ farmerId: profile._id }).sort({ createdAt: -1 });
        return {
          profile,
          lands,
          crops,
          totalCrops: crops.length,
          verifiedCrops: crops.filter(c => c.status === 'VERIFIED').length
        };
      })
    );

    return res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export verified crops report data
// @route   GET /api/officer/export
// @access  Private (OFFICER)
export const exportVerifiedReport = async (req, res) => {
  try {
    const { year } = req.query;
    const query = { status: 'VERIFIED' };
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

    return res.status(200).json({ success: true, count: csvData.length, data: csvData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
