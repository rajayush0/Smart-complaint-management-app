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
    // Global role kept for backward compat, but org-level role takes precedence
    role: {
      type: String,
      enum: ['user', 'staff', 'admin'],
      default: 'user',
    },
    department: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ── NEW: Multi-org support ────────────────────────────────
    // Has the user completed role selection + org join/create?
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    // All organizations this user belongs to (with per-org role)
    organizations: [
      {
        org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
        role: { type: String, enum: ['admin', 'staff', 'user'], default: 'user' },
        isDefault: { type: Boolean, default: false },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);