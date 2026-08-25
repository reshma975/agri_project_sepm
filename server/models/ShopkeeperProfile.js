import mongoose from 'mongoose';

const shopkeeperProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      default: '',
      trim: true,
    },
    primaryLocation: {
      type: String,
      default: 'Vijayawada',
      trim: true,
    },
    tradeLicenseNo: {
      type: String,
      default: '',
    },
    timings: {
      weekday: {
        type: String,
        default: '7:30 AM - 8:00 PM',
      },
      sunday: {
        type: String,
        default: '7:30 AM - 1:00 PM',
      },
      note: {
        type: String,
        default: 'Timings may change on festival days',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const ShopkeeperProfile = mongoose.model('ShopkeeperProfile', shopkeeperProfileSchema);
