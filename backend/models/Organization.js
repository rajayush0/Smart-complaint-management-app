import mongoose from 'mongoose';
import crypto from 'crypto';

// Generate a random 8-character uppercase alphanumeric code
const generateInviteCode = () =>
  crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. "A3F2B9C1"

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    inviteCode: {
      type: String,
      unique: true,
      default: generateInviteCode,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // All members with their role inside this org
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['admin', 'staff', 'user'], default: 'user' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure unique invite code on save (regenerate on collision)
organizationSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  let exists = true;
  while (exists) {
    this.inviteCode = generateInviteCode();
    exists = await mongoose.model('Organization').findOne({ inviteCode: this.inviteCode });
  }
  next();
});

export default mongoose.model('Organization', organizationSchema);
