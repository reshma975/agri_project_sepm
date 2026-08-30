import mongoose from 'mongoose';
import { OfficerProfile } from '../models/OfficerProfile.js';
import { CropRegistration } from '../models/CropRegistration.js';
import { CropRegistrationHistory } from '../models/CropRegistrationHistory.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { Land } from '../models/Land.js';
import { VerificationIssue } from '../models/VerificationIssue.js';
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

// Helper to resolve effective land status from land record and its crops
const resolveLandStatus = (land, crops = [], issues = []) => {
  // If there are still active OPEN issues that the farmer has not resubmitted yet
  const hasUnresubmittedIssues = Array.isArray(issues) && issues.some((i) => i.status === 'OPEN');
  const hasReturnedCrops = Array.isArray(crops) && crops.some((c) => c.status === 'RETURNED_FOR_CORRECTION');

  if (hasUnresubmittedIssues || hasReturnedCrops) {
    return 'RESUBMIT_NEEDED';
  }

  if (land.overallVerificationStatus === 'VERIFIED' || (crops.length > 0 && crops.every((c) => c.status === 'VERIFIED'))) {
    return 'VERIFIED';
  }

  if (land.overallVerificationStatus === 'REJECTED' || (crops.length > 0 && crops.every((c) => c.status === 'REJECTED'))) {
    return 'REJECTED';
  }

  if (
    land.overallVerificationStatus === 'SUBMITTED' ||
    land.overallVerificationStatus === 'UNDER_VERIFICATION' ||
    crops.some((c) => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status))
  ) {
    return 'PENDING_VERIFICATION';
  }

  if (land.overallVerificationStatus === 'RESUBMIT_NEEDED') {
    return 'RESUBMIT_NEEDED';
  }

  return 'DRAFT';
};

// @desc    Get officer dashboard summary (Land/Parcel Level Counts & Queue)
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

    // Find all lands strictly situated in officer's registered mandal
    const mandalLands = await Land.find({
      mandal: new RegExp(`^${officerMandal.trim()}$`, 'i')
    })
      .populate({
        path: 'farmerId',
        populate: { path: 'userId', select: 'name email phone username avatar' }
      })
      .sort({ updatedAt: -1, createdAt: -1 });

    const mandalLandIds = mandalLands.map((l) => l._id);

    // Fetch crops registered on these lands in this mandal
    const mandalCrops = await CropRegistration.find({
      $or: [
        { landId: { $in: mandalLandIds } },
        { mandal: new RegExp(`^${officerMandal.trim()}$`, 'i') }
      ]
    }).populate({
      path: 'farmerId',
      populate: { path: 'userId', select: 'name email phone username avatar' }
    });

    // Fetch all open/unresolved issues for these lands
    const openIssues = await VerificationIssue.find({
      landId: { $in: mandalLandIds },
      status: { $ne: 'RESOLVED' }
    });

    // Group crops and issues by Land Parcel
    const cropsByLandId = {};
    const cropsBySurveyFarmer = {};

    for (const crop of mandalCrops) {
      if (crop.landId) {
        const lid = crop.landId._id ? crop.landId._id.toString() : crop.landId.toString();
        if (!cropsByLandId[lid]) cropsByLandId[lid] = [];
        cropsByLandId[lid].push(crop);
      }
      const fId = crop.farmerId?._id?.toString() || crop.farmerId?.toString() || '';
      const surveyKey = `${fId}__${(crop.surveyNumber || '').trim().toLowerCase()}`;
      if (!cropsBySurveyFarmer[surveyKey]) cropsBySurveyFarmer[surveyKey] = [];
      cropsBySurveyFarmer[surveyKey].push(crop);
    }

    const issuesByLandId = {};
    for (const issue of openIssues) {
      const lid = issue.landId.toString();
      if (!issuesByLandId[lid]) issuesByLandId[lid] = [];
      issuesByLandId[lid].push(issue);
    }

    // Process every Land Parcel case
    let pendingParcelsCount = 0;
    let verifiedParcelsCount = 0;
    let returnedParcelsCount = 0;
    let rejectedParcelsCount = 0;

    const landApplications = [];

    for (const land of mandalLands) {
      const lid = land._id.toString();
      const fId = land.farmerId?._id?.toString() || land.farmerId?.toString() || '';
      const surveyKey = `${fId}__${(land.surveyNumber || '').trim().toLowerCase()}`;

      // Collect crops linked by landId OR by matching farmerId + surveyNumber
      const linkedCrops = cropsByLandId[lid] || cropsBySurveyFarmer[surveyKey] || [];
      const linkedIssues = issuesByLandId[lid] || [];

      const effectiveStatus = resolveLandStatus(land, linkedCrops, linkedIssues);

      if (effectiveStatus === 'PENDING_VERIFICATION') {
        pendingParcelsCount++;
      } else if (effectiveStatus === 'VERIFIED') {
        verifiedParcelsCount++;
      } else if (effectiveStatus === 'RESUBMIT_NEEDED') {
        returnedParcelsCount++;
      } else if (effectiveStatus === 'REJECTED') {
        rejectedParcelsCount++;
      }

      // Only include pending verification or resubmission-needed parcels in the pending queue
      // Verified parcels are accessible via 'Verified History' tab
      if (['PENDING_VERIFICATION', 'RESUBMIT_NEEDED'].includes(effectiveStatus)) {
        const farmerDoc = land.farmerId || {};
        const docs = farmerDoc.documents || {};
        const hasAadhaar = Boolean(docs.aadhaarDoc?.fileName);
        const hasPassbook = Boolean(docs.passbookDoc?.fileName);
        const hasLandRecord = Boolean(docs.landRecordDoc?.fileName);

        landApplications.push({
          _id: land._id,
          landId: land.landId || `LND-${land.surveyNumber}`,
          surveyNumber: land.surveyNumber,
          totalArea: land.totalArea,
          areaUnit: land.areaUnit || 'Acres',
          village: land.village || farmerDoc.village || 'Village',
          mandal: land.mandal || officerMandal,
          district: land.district || 'Vijayawada',
          ownershipType: land.ownershipType || 'Owned',
          overallVerificationStatus: effectiveStatus,
          resubmissionCount: land.resubmissionCount || linkedCrops[0]?.resubmissionCount || 0,
          farmer: farmerDoc,
          farmerId: farmerDoc._id,
          farmerCode: farmerDoc.farmerId || 'FMR-ID',
          user: farmerDoc.userId || {},
          documents: docs,
          documentsStatus: {
            aadhaar: hasAadhaar,
            passbook: hasPassbook,
            landRecord: hasLandRecord,
            allUploaded: hasAadhaar && hasPassbook && hasLandRecord,
          },
          crops: linkedCrops,
          cropCount: linkedCrops.length,
          cultivatedAreaTotal: linkedCrops.reduce((sum, c) => sum + (c.cultivatedArea || 0), 0),
          issues: linkedIssues,
          openIssuesCount: linkedIssues.filter((i) => i.status === 'OPEN').length,
          resubmittedIssuesCount: linkedIssues.filter((i) => i.status === 'RESUBMITTED').length,
          landIssuesCount: linkedIssues.filter((i) => i.issueLevel === 'LAND' && i.status === 'OPEN').length,
          cropIssuesCount: linkedIssues.filter((i) => i.issueLevel === 'CROP' && i.status === 'OPEN').length,
          submittedAt: land.submittedAt || linkedCrops[0]?.submittedAt || land.updatedAt,
          reviewedAt: land.reviewedAt || linkedCrops[0]?.reviewedAt || null,
        });
      }
    }

    // Sort queue by submission date (newest first, priority to pending/resubmit)
    landApplications.sort((a, b) => {
      const priorityOrder = { PENDING_VERIFICATION: 1, RESUBMIT_NEEDED: 2, VERIFIED: 3, REJECTED: 4, DRAFT: 5 };
      const pDiff = (priorityOrder[a.overallVerificationStatus] || 5) - (priorityOrder[b.overallVerificationStatus] || 5);
      if (pDiff !== 0) return pDiff;
      return new Date(b.submittedAt || b._id.getTimestamp()) - new Date(a.submittedAt || a._id.getTimestamp());
    });

    // Group pending applications by Farmer for backward-compatibility view
    const farmerMap = {};
    for (const landApp of landApplications) {
      const fId = landApp.farmerId?.toString() || 'unknown';
      if (!farmerMap[fId]) {
        farmerMap[fId] = {
          farmerId: landApp.farmerId,
          farmerCode: landApp.farmerCode,
          user: landApp.user,
          profile: landApp.farmer,
          village: landApp.village,
          mandal: landApp.mandal,
          district: landApp.district,
          registrationStatus: landApp.farmer?.registrationStatus || 'UNVERIFIED',
          documents: landApp.documents,
          documentsStatus: landApp.documentsStatus,
          parcels: [],
          crops: []
        };
      }
      farmerMap[fId].parcels.push(landApp);
      farmerMap[fId].crops.push(...landApp.crops);
    }

    // Fetch active registration deadline for this mandal
    let deadline = await RegistrationDeadline.findOne({
      mandal: new RegExp(`^${officerMandal}$`, 'i'),
      isActive: true
    }).sort({ createdAt: -1 });

    const distinctFarmerIds = new Set(
      mandalLands.map((l) => (l.farmerId?._id || l.farmerId)?.toString()).filter(Boolean)
    );

    return res.status(200).json({
      success: true,
      officer,
      mandal: officerMandal,
      deadline,
      stats: {
        pending: pendingParcelsCount,
        verified: verifiedParcelsCount,
        returned: returnedParcelsCount,
        rejected: rejectedParcelsCount,
        totalParcels: mandalLands.length,
        totalCrops: mandalCrops.length,
        totalFarmersInMandal: distinctFarmerIds.size,
        totalReviewed: verifiedParcelsCount + returnedParcelsCount + rejectedParcelsCount
      },
      landApplications,
      farmerApplications: Object.values(farmerMap),
      pendingApplications: mandalCrops.filter((c) => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status))
    });
  } catch (error) {
    console.error('getOfficerDashboard error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complete Land Parcel Verification Case (Land, Documents, all Crops, and Issues)
// @route   GET /api/officer/lands/:id
// @access  Private (OFFICER)
export const getLandVerificationDetails = async (req, res) => {
  try {
    const rawId = req.params.id;
    let land = null;

    if (mongoose.isValidObjectId(rawId)) {
      land = await Land.findById(rawId).populate({
        path: 'farmerId',
        populate: { path: 'userId', select: 'name email phone username avatar' }
      });
    }
    if (!land) {
      land = await Land.findOne({ landId: rawId }).populate({
        path: 'farmerId',
        populate: { path: 'userId', select: 'name email phone username avatar' }
      });
    }

    // Fallback: If passed a crop ID, locate parent Land parcel
    if (!land && mongoose.isValidObjectId(rawId)) {
      const crop = await CropRegistration.findById(rawId);
      if (crop) {
        if (crop.landId) {
          land = await Land.findById(crop.landId).populate({
            path: 'farmerId',
            populate: { path: 'userId', select: 'name email phone username avatar' }
          });
        }
        if (!land) {
          land = await Land.findOne({
            farmerId: crop.farmerId,
            surveyNumber: crop.surveyNumber
          }).populate({
            path: 'farmerId',
            populate: { path: 'userId', select: 'name email phone username avatar' }
          });
        }
      }
    }

    if (!land) {
      return res.status(404).json({ success: false, message: 'Land parcel verification case not found' });
    }

    // Find all registered crops on this land parcel
    const crops = await CropRegistration.find({
      $or: [
        { landId: land._id },
        { farmerId: land.farmerId?._id || land.farmerId, surveyNumber: land.surveyNumber }
      ]
    }).sort({ createdAt: -1 });

    const cropIds = crops.map((c) => c._id);

    // Find all verification issues (open and resolved)
    const issues = await VerificationIssue.find({
      landId: land._id
    }).sort({ createdAt: -1 });

    // Find verification history for this land parcel and its crops
    const history = await CropRegistrationHistory.find({
      $or: [{ landId: land._id }, { registrationId: { $in: cropIds } }]
    }).sort({ timestamp: -1 });

    const farmerProfile = land.farmerId || {};
    const effectiveStatus = resolveLandStatus(land, crops, issues.filter((i) => i.status !== 'RESOLVED'));

    return res.status(200).json({
      success: true,
      land: {
        ...land.toObject(),
        overallVerificationStatus: effectiveStatus
      },
      farmer: farmerProfile.userId || {},
      farmerProfile,
      documents: farmerProfile.documents || {},
      crops,
      issues,
      history
    });
  } catch (error) {
    console.error('getLandVerificationDetails error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify and Approve Land Parcel (and all its crops)
// @route   PUT /api/officer/lands/:id/verify
// @access  Private (OFFICER)
export const verifyLandParcel = async (req, res) => {
  try {
    const rawId = req.params.id;
    let land = null;
    if (mongoose.isValidObjectId(rawId)) {
      land = await Land.findById(rawId);
    }
    if (!land) {
      land = await Land.findOne({ landId: rawId });
    }
    if (!land && mongoose.isValidObjectId(rawId)) {
      const crop = await CropRegistration.findById(rawId);
      if (crop?.landId) land = await Land.findById(crop.landId);
      if (!land && crop) land = await Land.findOne({ farmerId: crop.farmerId, surveyNumber: crop.surveyNumber });
    }

    if (!land) {
      return res.status(404).json({ success: false, message: 'Land parcel not found' });
    }

    const officer = await OfficerProfile.findOne({ userId: req.user._id });
    const officerComment = req.body.comment || 'Cadastral land details, title documents, and crop pre-registration verified & approved.';

    // 1. Update Land Parcel
    land.overallVerificationStatus = 'VERIFIED';
    land.reviewedBy = officer ? officer._id : null;
    land.reviewedAt = new Date();
    land.officerComment = officerComment;
    await land.save();

    // 2. Update all crops on this parcel
    const crops = await CropRegistration.find({
      $or: [
        { landId: land._id },
        { farmerId: land.farmerId, surveyNumber: land.surveyNumber }
      ]
    });

    for (const crop of crops) {
      crop.status = 'VERIFIED';
      crop.reviewedBy = officer ? officer._id : null;
      crop.reviewedAt = new Date();
      crop.officerComment = officerComment;
      await crop.save();

      await CropRegistrationHistory.create({
        registrationId: crop._id,
        landId: land._id,
        officerId: officer ? officer._id : null,
        officerName: req.user.name || 'Govt Agriculture Officer',
        action: 'VERIFIED',
        comment: officerComment
      });
    }

    // 3. Mark all open issues as RESOLVED
    await VerificationIssue.updateMany(
      { landId: land._id, status: { $ne: 'RESOLVED' } },
      { $set: { status: 'RESOLVED', resolvedAt: new Date() } }
    );

    // 4. Update farmer profile
    const farmer = await FarmerProfile.findById(land.farmerId);
    if (farmer) {
      farmer.registrationStatus = 'VERIFIED';
      await farmer.save();
    }

    // 5. Create parcel history
    await CropRegistrationHistory.create({
      landId: land._id,
      officerId: officer ? officer._id : null,
      officerName: req.user.name || 'Govt Agriculture Officer',
      action: 'VERIFIED',
      comment: `Land Parcel Survey No. ${land.surveyNumber} (${crops.length} crops) certified & approved.`
    });

    return res.status(200).json({
      success: true,
      message: `Land Parcel (Survey No. ${land.surveyNumber}) and ${crops.length} crop(s) verified successfully!`,
      land,
      cropsCount: crops.length
    });
  } catch (error) {
    console.error('verifyLandParcel error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Return Land Parcel for Correction with Granular Verification Issues
// @route   PUT /api/officer/lands/:id/return
// @access  Private (OFFICER)
export const returnLandForCorrection = async (req, res) => {
  try {
    const rawId = req.params.id;
    let land = null;
    if (mongoose.isValidObjectId(rawId)) {
      land = await Land.findById(rawId);
    }
    if (!land) {
      land = await Land.findOne({ landId: rawId });
    }
    if (!land && mongoose.isValidObjectId(rawId)) {
      const crop = await CropRegistration.findById(rawId);
      if (crop?.landId) land = await Land.findById(crop.landId);
      if (!land && crop) land = await Land.findOne({ farmerId: crop.farmerId, surveyNumber: crop.surveyNumber });
    }

    if (!land) {
      return res.status(404).json({ success: false, message: 'Land parcel not found' });
    }

    const { issues, reason, comment } = req.body;

    const officer = await OfficerProfile.findOne({ userId: req.user._id });
    const officerName = req.user.name || 'Govt Agriculture Officer';

    // Normalize issues list
    let issueList = [];
    if (Array.isArray(issues) && issues.length > 0) {
      issueList = issues.filter((i) => i && i.description && i.description.trim());
    }

    // Fallback if officer provided only a single reason/comment string
    if (issueList.length === 0) {
      const singleText = (reason || comment || '').trim();
      if (!singleText) {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least one verification issue or correction note for the farmer.'
        });
      }
      issueList = [
        {
          issueLevel: 'LAND',
          cropId: null,
          issueType: 'OTHER',
          description: singleText
        }
      ];
    }

    // 1. Check current resubmission count and enforce 3-attempt limit
    const currentReturns = land.resubmissionCount || 0;
    const nextReturnCount = currentReturns + 1;

    // RULE: If more than 3 correction attempts (attempt #4+) -> Automatically Reject
    if (nextReturnCount > 3) {
      land.overallVerificationStatus = 'REJECTED';
      land.resubmissionCount = nextReturnCount;
      land.reviewedBy = officer ? officer._id : null;
      land.reviewedAt = new Date();
      land.officerComment = `Application automatically rejected: Maximum correction limit (3 attempts) exceeded. Officer note: ${issueList.map((i) => i.description).join('; ') || 'Issues remained unresolved after 3 correction cycles.'}`;
      await land.save();

      const crops = await CropRegistration.find({
        $or: [
          { landId: land._id },
          { farmerId: land.farmerId, surveyNumber: land.surveyNumber }
        ]
      });

      for (const crop of crops) {
        crop.status = 'REJECTED';
        crop.resubmissionCount = nextReturnCount;
        crop.reviewedBy = officer ? officer._id : null;
        crop.reviewedAt = new Date();
        crop.officerComment = land.officerComment;
        await crop.save();

        await CropRegistrationHistory.create({
          registrationId: crop._id,
          landId: land._id,
          officerId: officer ? officer._id : null,
          officerName,
          action: 'REJECTED',
          comment: 'Application automatically rejected: Exceeded maximum allowed correction attempts (3 cycles).'
        });
      }

      await VerificationIssue.deleteMany({
        landId: land._id,
        status: { $ne: 'RESOLVED' }
      });

      await CropRegistrationHistory.create({
        landId: land._id,
        officerId: officer ? officer._id : null,
        officerName,
        action: 'REJECTED',
        comment: 'Application automatically rejected: Exceeded maximum allowed correction attempts (3 cycles).'
      });

      return res.status(200).json({
        success: true,
        autoRejected: true,
        message: `Maximum correction limit (3 attempts) exceeded. Application for Survey No. ${land.surveyNumber} has been automatically rejected.`,
        land
      });
    }

    // 2. Remove previous open/unresolved issues for this land parcel so they don't accumulate
    await VerificationIssue.deleteMany({
      landId: land._id,
      status: { $ne: 'RESOLVED' }
    });

    // 3. Create Granular VerificationIssue records
    const createdIssues = [];
    const affectedCropIds = new Set();

    for (const item of issueList) {
      const level = item.issueLevel === 'CROP' && item.cropId ? 'CROP' : 'LAND';
      const cropIdVal = level === 'CROP' ? item.cropId : null;

      if (cropIdVal) {
        affectedCropIds.add(cropIdVal.toString());
      }

      const issueDoc = await VerificationIssue.create({
        landId: land._id,
        farmerId: land.farmerId,
        cropId: cropIdVal,
        issueLevel: level,
        issueType: item.issueType || 'OTHER',
        description: item.description.trim(),
        status: 'OPEN',
        createdBy: officer ? officer._id : null,
        officerName
      });
      createdIssues.push(issueDoc);
    }

    // 4. Update Land overall verification status & increment resubmission count
    land.overallVerificationStatus = 'RESUBMIT_NEEDED';
    land.resubmissionCount = nextReturnCount;
    land.reviewedBy = officer ? officer._id : null;
    land.reviewedAt = new Date();
    land.officerComment = createdIssues.map((i) => `[${i.issueLevel}] ${i.description}`).join('; ');
    await land.save();

    // 5. Update status on crops: if an issue targeted a specific crop, mark that crop RETURNED_FOR_CORRECTION
    const crops = await CropRegistration.find({
      $or: [
        { landId: land._id },
        { farmerId: land.farmerId, surveyNumber: land.surveyNumber }
      ]
    });

    for (const crop of crops) {
      const cid = crop._id.toString();
      const hasSpecificIssue = affectedCropIds.has(cid);
      const cropIssue = createdIssues.find((i) => i.cropId?.toString() === cid);

      if (hasSpecificIssue) {
        crop.status = 'RETURNED_FOR_CORRECTION';
        crop.resubmissionCount = nextReturnCount;
        crop.reviewedBy = officer ? officer._id : null;
        crop.reviewedAt = new Date();
        crop.officerComment = cropIssue ? cropIssue.description : '';
        await crop.save();

        await CropRegistrationHistory.create({
          registrationId: crop._id,
          landId: land._id,
          officerId: officer ? officer._id : null,
          officerName,
          action: 'RETURNED_FOR_CORRECTION',
          comment: `(Correction Attempt ${nextReturnCount} of 3) ${crop.officerComment}`
        });
      } else if (affectedCropIds.size === 0) {
        // Pure LAND-level issue: crop status updates to resubmission needed
        crop.status = 'RETURNED_FOR_CORRECTION';
        crop.resubmissionCount = nextReturnCount;
        crop.reviewedBy = officer ? officer._id : null;
        crop.reviewedAt = new Date();
        crop.officerComment = ''; // Land-level issues are displayed above all crop cards
        await crop.save();

        await CropRegistrationHistory.create({
          registrationId: crop._id,
          landId: land._id,
          officerId: officer ? officer._id : null,
          officerName,
          action: 'RETURNED_FOR_CORRECTION',
          comment: `(Correction Attempt ${nextReturnCount} of 3) Parcel returned for document/land corrections: ${land.officerComment}`
        });
      }
    }

    // 6. Update Farmer profile status
    const farmer = await FarmerProfile.findById(land.farmerId);
    if (farmer && farmer.registrationStatus !== 'VERIFIED') {
      farmer.registrationStatus = 'RETURNED_FOR_CORRECTION';
      await farmer.save();
    }

    // 7. Create History record for the Land parcel
    await CropRegistrationHistory.create({
      landId: land._id,
      officerId: officer ? officer._id : null,
      officerName,
      action: 'RETURNED_FOR_CORRECTION',
      comment: `Returned for correction (Attempt ${nextReturnCount} of 3) with ${createdIssues.length} issue(s) reported.`
    });

    return res.status(200).json({
      success: true,
      message: `Land parcel returned for correction (Attempt ${nextReturnCount} of 3) with ${createdIssues.length} issue(s) recorded.`,
      land,
      issues: createdIssues,
      attemptNumber: nextReturnCount,
      maxAttempts: 3
    });
  } catch (error) {
    console.error('returnLandForCorrection error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject Land Parcel Verification
// @route   PUT /api/officer/lands/:id/reject
// @access  Private (OFFICER)
export const rejectLandParcel = async (req, res) => {
  try {
    const rawId = req.params.id;
    let land = null;
    if (mongoose.isValidObjectId(rawId)) {
      land = await Land.findById(rawId);
    }
    if (!land) {
      land = await Land.findOne({ landId: rawId });
    }
    if (!land && mongoose.isValidObjectId(rawId)) {
      const crop = await CropRegistration.findById(rawId);
      if (crop?.landId) land = await Land.findById(crop.landId);
      if (!land && crop) land = await Land.findOne({ farmerId: crop.farmerId, surveyNumber: crop.surveyNumber });
    }

    if (!land) {
      return res.status(404).json({ success: false, message: 'Land parcel not found' });
    }

    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a reason for rejecting the application.' });
    }

    const officer = await OfficerProfile.findOne({ userId: req.user._id });
    const officerName = req.user.name || 'Govt Agriculture Officer';

    land.overallVerificationStatus = 'REJECTED';
    land.reviewedBy = officer ? officer._id : null;
    land.reviewedAt = new Date();
    land.officerComment = reason.trim();
    await land.save();

    // Reject all crops on this land parcel
    const crops = await CropRegistration.find({
      $or: [
        { landId: land._id },
        { farmerId: land.farmerId, surveyNumber: land.surveyNumber }
      ]
    });

    for (const crop of crops) {
      crop.status = 'REJECTED';
      crop.reviewedBy = officer ? officer._id : null;
      crop.reviewedAt = new Date();
      crop.officerComment = reason.trim();
      await crop.save();

      await CropRegistrationHistory.create({
        registrationId: crop._id,
        landId: land._id,
        officerId: officer ? officer._id : null,
        officerName,
        action: 'REJECTED',
        comment: reason.trim()
      });
    }

    await CropRegistrationHistory.create({
      landId: land._id,
      officerId: officer ? officer._id : null,
      officerName,
      action: 'REJECTED',
      comment: reason.trim()
    });

    return res.status(200).json({
      success: true,
      message: `Land parcel (Survey No. ${land.surveyNumber}) and associated crops rejected.`,
      land
    });
  } catch (error) {
    console.error('rejectLandParcel error:', error);
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

    const mandalLands = await Land.find({
      mandal: new RegExp(`^${officerMandal.trim()}$`, 'i')
    }).populate({
      path: 'farmerId',
      populate: { path: 'userId', select: 'name email phone username avatar' }
    });

    const { status, year, search } = req.query;

    let results = [];

    for (const land of mandalLands) {
      const crops = await CropRegistration.find({
        $or: [
          { landId: land._id },
          { farmerId: land.farmerId?._id, surveyNumber: land.surveyNumber }
        ]
      });

      const issues = await VerificationIssue.find({
        landId: land._id,
        status: { $ne: 'RESOLVED' }
      });

      const effectiveStatus = resolveLandStatus(land, crops, issues);

      if (status && status !== 'All') {
        if (status === 'SUBMITTED' && effectiveStatus !== 'PENDING_VERIFICATION') continue;
        if (status === 'VERIFIED' && effectiveStatus !== 'VERIFIED') continue;
        if (status === 'RETURNED_FOR_CORRECTION' && effectiveStatus !== 'RESUBMIT_NEEDED') continue;
        if (status === 'REJECTED' && effectiveStatus !== 'REJECTED') continue;
      }

      if (year && year !== 'All') {
        const cropYears = crops.map((c) => c.year);
        if (!cropYears.includes(Number(year))) continue;
      }

      results.push({
        _id: land._id,
        landId: land.landId,
        surveyNumber: land.surveyNumber,
        totalArea: land.totalArea,
        village: land.village,
        mandal: land.mandal,
        district: land.district,
        ownershipType: land.ownershipType,
        overallVerificationStatus: effectiveStatus,
        farmer: land.farmerId,
        crops,
        issues,
        submittedAt: land.submittedAt || crops[0]?.submittedAt || land.updatedAt
      });
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter((item) => {
        const farmerName = item.farmer?.userId?.name?.toLowerCase() || '';
        const farmerId = item.farmer?.farmerId?.toLowerCase() || '';
        const survey = item.surveyNumber?.toLowerCase() || '';
        const village = item.village?.toLowerCase() || '';
        const cropNames = item.crops.map((c) => c.cropName.toLowerCase()).join(' ');
        return (
          farmerName.includes(q) ||
          farmerId.includes(q) ||
          survey.includes(q) ||
          village.includes(q) ||
          cropNames.includes(q)
        );
      });
    }

    return res.status(200).json({
      success: true,
      mandal: officerMandal,
      count: results.length,
      applications: results
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed crop application for officer review (Enhanced with Land + Issues)
// @route   GET /api/officer/crops/:id
// @access  Private (OFFICER)
export const getCropApplicationDetails = async (req, res) => {
  return getLandVerificationDetails(req, res);
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
    const issues = await VerificationIssue.find({ farmerId: profile._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      profile,
      lands,
      crops,
      issues,
      documents: profile.documents
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify crop registration (Delegates to Land Verification)
// @route   PUT /api/officer/crops/:id/verify
// @access  Private (OFFICER)
export const verifyCrop = async (req, res) => {
  return verifyLandParcel(req, res);
};

// @desc    Return crop registration for correction / resubmission (Delegates to Land Verification)
// @route   PUT /api/officer/crops/:id/return
// @access  Private (OFFICER)
export const returnCropForCorrection = async (req, res) => {
  return returnLandForCorrection(req, res);
};

// @desc    Reject crop registration (Delegates to Land Verification)
// @route   PUT /api/officer/crops/:id/reject
// @access  Private (OFFICER)
export const rejectCrop = async (req, res) => {
  return rejectLandParcel(req, res);
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
    const lands = await Land.find({ farmerId: targetFarmerId });

    for (const land of lands) {
      req.params.id = land._id.toString();
      await verifyLandParcel(req, {
        status: () => ({ json: () => {} })
      });
    }

    if (farmer) {
      farmer.registrationStatus = 'VERIFIED';
      await farmer.save();
    }

    return res.status(200).json({
      success: true,
      message: `Successfully verified all land parcels and crops for this farmer`,
      verifiedCount: lands.length
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
    const { reason, issues } = req.body;
    if (!reason && (!issues || issues.length === 0)) {
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
    const lands = await Land.find({ farmerId: targetFarmerId });

    for (const land of lands) {
      req.params.id = land._id.toString();
      await returnLandForCorrection(req, {
        status: () => ({ json: () => {} })
      });
    }

    if (farmer && farmer.registrationStatus !== 'VERIFIED') {
      farmer.registrationStatus = 'RETURNED_FOR_CORRECTION';
      await farmer.save();
    }

    return res.status(200).json({
      success: true,
      message: `Returned ${lands.length} land parcel(s) for correction & resubmission`,
      returnedCount: lands.length
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

    // 2. Find lands matching query
    const matchingLands = await Land.find({
      $or: [
        { surveyNumber: { $regex: q, $options: 'i' } },
        { village: { $regex: q, $options: 'i' } },
        { mandal: { $regex: q, $options: 'i' } },
        { landId: { $regex: q, $options: 'i' } }
      ]
    });
    const landFarmerIds = matchingLands.map((l) => l.farmerId);

    // 3. Find crops matching query
    const matchingCrops = await CropRegistration.find({
      $or: [
        { cropName: { $regex: q, $options: 'i' } },
        { registrationId: { $regex: q, $options: 'i' } },
        { surveyNumber: { $regex: q, $options: 'i' } }
      ]
    });
    const cropFarmerIds = matchingCrops.map((c) => c.farmerId);

    // 4. Find candidate profiles
    const candidateProfiles = await FarmerProfile.find({
      $or: [
        { farmerId: { $regex: q, $options: 'i' } },
        { village: { $regex: q, $options: 'i' } },
        { mandal: { $regex: q, $options: 'i' } },
        { userId: { $in: userIds } },
        { _id: { $in: [...landFarmerIds, ...cropFarmerIds] } }
      ]
    }).populate('userId', 'name email phone username avatar');

    // Link user matches
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

    // 5. Aggregate land and crop counts
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
    const mandalLands = await Land.find({
      mandal: new RegExp(`^${officerMandal.trim()}$`, 'i')
    });
    const mandalLandIds = mandalLands.map((l) => l._id);

    const { year } = req.query;
    const query = {
      status: 'VERIFIED',
      $or: [
        { landId: { $in: mandalLandIds } },
        { mandal: new RegExp(`^${officerMandal.trim()}$`, 'i') }
      ]
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
