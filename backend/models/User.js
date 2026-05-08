import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'staff', 'admin'],
      default: 'user',
    },
    department: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    age: {
      type: Number,
      default: null,
    },
    specialization: {
      type: String,
      default: '',
    },
    specializationGroup: {
      type: String,
      enum: ['Network', 'Maintenance', 'Hardware', 'Software', ''],
      default: '',
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);