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
    // Optional current crop if cultivated
    currentCrop: {
      type: String,
      default: '',
      trim: true,
    },
    // Crop category if crop is specified
    cropCategory: {
      type: String,
      enum: ['Cereals', 'Pulses', 'Oilseeds', 'Commercial / Cash', 'Horticulture', 'Vegetables', 'Fruits', 'Other', 'None'],
      default: 'None',
    },
    // Estimated duration of the crop in months (e.g. 3, 4, 6, 12 months)
    estimatedDurationMonths: {
      type: Number,
      default: null,
      min: [1, 'Estimated duration must be at least 1 month'],
      max: [60, 'Estimated duration cannot exceed 60 months'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure surveyNumber lookups are fast per farmer
landSchema.index({ farmerId: 1, surveyNumber: 1 });

export const Land = mongoose.model('Land', landSchema);
