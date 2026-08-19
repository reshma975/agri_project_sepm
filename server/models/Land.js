import mongoose from 'mongoose';

const landSchema = new mongoose.Schema(
  {
    landId: {
      type: String,
      default: () => `LND${Math.floor(10000 + Math.random() * 90000)}`,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: true,
    },
    surveyNumber: {
      type: String,
      required: [true, 'Survey number is required'],
      trim: true,
    },
    village: {
      type: String,
      required: true,
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
    totalArea: {
      type: Number,
      required: [true, 'Total land area is required'],
      min: [0.1, 'Area must be greater than 0'],
    },
    areaUnit: {
      type: String,
      enum: ['Acres', 'Hectares', 'Guntas', 'Cents'],
      default: 'Acres',
    },
    ownershipType: {
      type: String,
      enum: ['Owned', 'Leased', 'Worker', 'Other'],
      default: 'Owned',
    },
  },
  {
    timestamps: true,
  }
);

export const Land = mongoose.model('Land', landSchema);
