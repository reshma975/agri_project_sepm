import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmerName: {
      type: String,
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.model('Review', reviewSchema);
