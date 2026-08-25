import mongoose from 'mongoose';

const cropRegistrationHistorySchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropRegistration',
      required: true,
    },
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfficerProfile',
      default: null,
    },
    officerName: {
      type: String,
      default: 'System / Automated',
    },
    action: {
      type: String,
      enum: ['SUBMITTED', 'VERIFIED', 'RETURNED_FOR_CORRECTION', 'REJECTED', 'RESUBMITTED', 'DRAFT_SAVED', 'UPDATED', 'EDITED'],
      required: true,
    },
    comment: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const CropRegistrationHistory = mongoose.model(
  'CropRegistrationHistory',
  cropRegistrationHistorySchema
);
