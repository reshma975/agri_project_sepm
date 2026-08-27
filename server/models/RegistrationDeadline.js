import mongoose from 'mongoose';

const registrationDeadlineSchema = new mongoose.Schema(
  {
    mandal: {
      type: String,
      required: [true, 'Mandal is required'],
      trim: true,
      index: true,
    },
    district: {
      type: String,
      default: 'Vijayawada',
      trim: true,
    },
    season: {
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid', 'Annual', 'Perennial'],
      default: 'Kharif',
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    deadlineDate: {
      type: Date,
      required: [true, 'Deadline date and time is required'],
    },
    description: {
      type: String,
      default: 'Official crop registration deadline set by Agricultural Department.',
      trim: true,
    },
    setByOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfficerProfile',
      default: null,
    },
    officerName: {
      type: String,
      default: 'Government Agriculture Officer',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const RegistrationDeadline = mongoose.model('RegistrationDeadline', registrationDeadlineSchema);
