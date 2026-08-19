import mongoose from 'mongoose';

const governmentUpdateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Update title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Agriculture',
        'Fertilizer',
        'Crop Insurance',
        'Financial Assistance',
        'Farmer Schemes',
        'Important Announcements',
      ],
      required: true,
      default: 'Farmer Schemes',
    },
    state: {
      type: String,
      default: 'All India / National',
    },
    targetCrops: {
      type: [String],
      default: ['Paddy', 'Wheat', 'Cotton', 'Chilli', 'Sugarcane', 'Maize', 'All Crops'],
    },
    season: {
      type: String,
      default: 'Kharif',
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      required: true,
      default: 'Ministry of Agriculture & Farmers Welfare, Govt. of India',
    },
    officialUrl: {
      type: String,
      default: 'https://agricoop.nic.in',
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80',
    },
    keyBenefits: {
      type: [String],
      default: [],
    },
    deadline: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const GovernmentUpdate = mongoose.model('GovernmentUpdate', governmentUpdateSchema);
