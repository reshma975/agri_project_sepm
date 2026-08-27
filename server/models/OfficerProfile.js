import mongoose from 'mongoose';

const officerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    officerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      default: 'Department of Agriculture & Farmer Welfare',
    },
    assignedArea: {
      type: String,
      required: true,
      default: 'Penamaluru Mandal, Krishna District',
    },
    mandal: {
      type: String,
      default: 'Penamaluru',
      trim: true,
    },
    district: {
      type: String,
      default: 'Vijayawada',
    },
    state: {
      type: String,
      default: 'Andhra Pradesh',
    },
    licenseNumber: {
      type: String,
      default: 'AP-AGRI-OFF-2024-8841',
    },
    designation: {
      type: String,
      default: 'Assistant Agricultural Officer (AAO)',
    },
  },
  {
    timestamps: true,
  }
);

export const OfficerProfile = mongoose.model('OfficerProfile', officerProfileSchema);
