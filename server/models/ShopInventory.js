import mongoose from 'mongoose';

const shopInventorySchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    customName: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      default: 'kg',
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: ['Full', 'In Stock', 'Low Stock', 'Out of Stock', 'Empty'],
      default: 'In Stock',
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto calculate status based on quantity
shopInventorySchema.pre('save', function (next) {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= 5) {
    this.status = 'Low Stock';
  } else if (this.quantity >= 100) {
    this.status = 'Full';
  } else {
    this.status = 'In Stock';
  }
  next();
});

export const ShopInventory = mongoose.model('ShopInventory', shopInventorySchema);
