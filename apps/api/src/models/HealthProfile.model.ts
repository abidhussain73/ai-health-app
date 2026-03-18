import mongoose from 'mongoose';

const HealthProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    diabetesType: { type: String },
    diagnosisDate: { type: Date }
  },
  { timestamps: true }
);

export const HealthProfileModel = mongoose.model('HealthProfile', HealthProfileSchema);
