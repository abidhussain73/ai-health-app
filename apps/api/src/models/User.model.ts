import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, select: false },
    emailVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['unverified', 'active', 'suspended', 'deleted'],
      default: 'unverified'
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'support', 'analyst'],
      default: 'user'
    },
    plan: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    oauthProviders: [
      {
        provider: { type: String },
        providerId: { type: String },
        accessToken: { type: String }
      }
    ],
    refreshTokenFamilies: [
      {
        family: { type: String },
        tokenHash: { type: String },
        expiresAt: { type: Date }
      }
    ],
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    expoPushToken: { type: String },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

UserSchema.index({ 'oauthProviders.providerId': 1 });

export const UserModel = mongoose.model('User', UserSchema);
