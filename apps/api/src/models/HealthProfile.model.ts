import mongoose from 'mongoose';

const HealthProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    diabetesType: { type: String },
    diagnosisDate: { type: Date },
    glucoseTargetMin: { type: Number, default: 80 },
    glucoseTargetMax: { type: Number, default: 130 },
    bloodPressureTargetSystolic: { type: Number, default: 120 },
    bloodPressureTargetDiastolic: { type: Number, default: 80 },
    demographic: {
      age: { type: Number },
      gender: { type: String },
      heightCm: { type: Number },
      weightKg: { type: Number },
      activityLevel: { type: String }
    },
    emergencyContacts: [
      {
        name: { type: String },
        phone: { type: String },
        relationship: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export const HealthProfileModel = mongoose.model('HealthProfile', HealthProfileSchema);
