import mongoose from 'mongoose';

const cropRegistrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      unique: true,
      default: () => `CRP${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: true,
    },
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land',
      required: false,
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    cropCategory: {
      type: String,
      enum: ['Cereals', 'Pulses', 'Oilseeds', 'Commercial / Cash', 'Horticulture', 'Vegetables', 'Fruits', 'Other'],
      default: 'Cereals',
    },
    surveyNumber: {
      type: String,
      required: [true, 'Survey number is required'],
      trim: true,
    },
    cultivatedArea: {
      type: Number,
      required: [true, 'Cultivated area is required'],
      min: [0.1, 'Area must be greater than 0'],
    },
    totalLandArea: {
      type: Number,
      default: 0,
    },
    areaUnit: {
      type: String,
      default: 'Acres',
    },
    ownershipType: {
      type: String,
      enum: ['Owned', 'Leased', 'Worker', 'Other'],
      default: 'Owned',
    },
    season: {
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid', 'Annual', 'Perennial'],
      required: [true, 'Crop season is required'],
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    sowingDate: {
      type: Date,
      required: [true, 'Sowing start date is required'],
    },
    harvestDate: {
      type: Date,
      default: null,
    },
    irrigationType: {
      type: String,
      enum: ['Borewell', 'Canal', 'Rainfed', 'Drip Irrigation', 'Sprinkler', 'Well', 'Other'],
      default: 'Borewell',
    },
    fertilizersUsed: {
      type: String,
      default: 'Urea, DAP, Potash',
    },
    pesticidesUsed: {
      type: String,
      default: 'Organic Neem Oil, Chlorpyrifos',
    },
    expectedHarvest: {
      type: String,
      default: '45 Quintals',
    },
    actualHarvest: {
      type: String,
      default: 'Nil (In Progress)',
    },
    priceSold: {
      type: String,
      default: 'Pending Sale',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'RETURNED_FOR_CORRECTION', 'REJECTED'],
      default: 'SUBMITTED',
    },
    officerComment: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfficerProfile',
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const CropRegistration = mongoose.model('CropRegistration', cropRegistrationSchema);
