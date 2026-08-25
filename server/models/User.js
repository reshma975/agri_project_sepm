import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      sparse: true,
      trim: true,
      lowercase: true,
      default: undefined,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    roles: {
      type: [String],
      enum: ['FARMER', 'SHOPKEEPER', 'OFFICER'],
      default: ['FARMER'],
    },
    // Backward-compatibility legacy field
    role: {
      type: String,
      enum: ['FARMER', 'SHOPKEEPER', 'OFFICER'],
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure roles array is unique and synchronized with legacy role field
userSchema.pre('save', function (next) {
  if (this.roles && this.roles.length > 0) {
    this.roles = [...new Set(this.roles)];
    if (!this.role || !this.roles.includes(this.role)) {
      this.role = this.roles[0];
    }
  } else if (this.role) {
    this.roles = [this.role];
  } else {
    this.roles = ['FARMER'];
    this.role = 'FARMER';
  }
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
