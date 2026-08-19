import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      default: () => `PRD${Math.floor(1000 + Math.random() * 9000)}`,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Tools', 'Machines', 'Fertilizer', 'Pesticide', 'Seeds', 'Others'],
      required: [true, 'Category is required'],
      default: 'Fertilizer',
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    },
    defaultUnit: {
      type: String,
      default: 'kg',
    },
    brand: {
      type: String,
      default: 'AgriGold Quality',
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model('Product', productSchema);
