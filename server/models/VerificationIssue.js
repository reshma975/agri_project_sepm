import mongoose from 'mongoose';

const verificationIssueSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      unique: true,
      default: () => `ISS${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`,
    },
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land',
      required: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: true,
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropRegistration',
      default: null, // Nullable: null when the issue is at the LAND / Document level
    },
    issueLevel: {
      type: String,
      enum: ['LAND', 'CROP'],
      required: true,
    },
    issueType: {
      type: String,
      enum: [
        'DOCUMENT_UNCLEAR',
        'SOWING_DATE_MISMATCH',
        'AREA_DISCREPANCY',
        'CROP_MISMATCH',
        'INVALID_SURVEY',
        'OTHER',
      ],
      default: 'OTHER',
    },
    description: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'RESUBMITTED', 'RESOLVED'],
      default: 'OPEN',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfficerProfile',
      default: null,
    },
    officerName: {
      type: String,
      default: 'Govt Agriculture Officer',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resubmittedAt: {
      type: Date,
      default: null,
    },
    farmerComment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

verificationIssueSchema.index({ landId: 1, status: 1 });
verificationIssueSchema.index({ cropId: 1, status: 1 });
verificationIssueSchema.index({ farmerId: 1, status: 1 });

export const VerificationIssue = mongoose.model('VerificationIssue', verificationIssueSchema);
