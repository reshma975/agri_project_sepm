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
  },
  {
    timestamps: true,
  }
);

export const ShopkeeperProfile = mongoose.model('ShopkeeperProfile', shopkeeperProfileSchema);
