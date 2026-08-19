import mongoose from 'mongoose';

const farmerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    farmerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: () => `FMR${Math.floor(100000 + Math.random() * 900000)}`,
    },
    village: {
      type: String,
      default: '',
      trim: true,
    },
    mandal: {
      type: String,
      default: '',
      trim: true,
    },
    district: {
      type: String,
      default: 'Vijayawada',
      trim: true,
    },
    state: {
      type: String,
      default: 'Andhra Pradesh',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    totalLandArea: {
      type: Number,
      default: 0,
    },
    preferredCrop: {
      type: String,
      default: 'Paddy',
    },
    registrationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'UNDER_VERIFICATION', 'VERIFIED'],
      default: 'UNVERIFIED',
    },
    documents: {
      aadhaarDoc: {
        fileName: { type: String, default: '' },
        fileSize: { type: String, default: '' },
        fileType: { type: String, default: '' },
        fileData: { type: String, default: '' },
        status: { type: String, default: 'Uploaded' },
        uploadedAt: { type: Date, default: Date.now },
      },
      passbookDoc: {
        fileName: { type: String, default: '' },
        fileSize: { type: String, default: '' },
        fileType: { type: String, default: '' },
        fileData: { type: String, default: '' },
        status: { type: String, default: 'Uploaded' },
        uploadedAt: { type: Date, default: Date.now },
      },
      landRecordDoc: {
        fileName: { type: String, default: '' },
        fileSize: { type: String, default: '' },
        fileType: { type: String, default: '' },
        fileData: { type: String, default: '' },
        status: { type: String, default: 'Uploaded' },
        uploadedAt: { type: Date, default: Date.now },
      },
    },
  },
  {
    timestamps: true,
  }
);

export const FarmerProfile = mongoose.model('FarmerProfile', farmerProfileSchema);
