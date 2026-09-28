import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    shopId: {
      type: String,
      unique: true,
      default: () => `SHP${Math.floor(1000 + Math.random() * 9000)}`,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location/City is required'],
      trim: true,
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
      required: [true, 'Specific address is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=600&q=80',
    },
    phone: {
      type: String,
      default: '+91 98480 12345',
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 12,
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

export const Shop = mongoose.model('Shop', shopSchema);
