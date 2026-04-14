import mongoose, { Schema, Document } from "mongoose";

export interface IUserMedicalProfile extends Document {
  userId: mongoose.Types.ObjectId;
  conditions: {
    hypertension: boolean;
    diabetes:     boolean;
    jointPain:    boolean;
    heartIssue:   boolean;
    other?:       string;
  };
  medications: { taking: boolean; notes?: string; };
  injuries:    { hasInjuries: boolean; notes?: string; };
  allergies:   { hasAllergies: boolean; notes?: string; };
  bmi:         number;
  heightCm:    number;
  weightKg:    number;
  createdAt:   Date;
  updatedAt:   Date;
}

const UserMedicalProfileSchema = new Schema<IUserMedicalProfile>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    conditions: {
      hypertension: { type: Boolean, default: false },
      diabetes:     { type: Boolean, default: false },
      jointPain:    { type: Boolean, default: false },
      heartIssue:   { type: Boolean, default: false },
      other:        { type: String,  default: "" },
    },
    medications: { taking: Boolean, notes: String },
    injuries:    { hasInjuries: Boolean, notes: String },
    allergies:   { hasAllergies: Boolean, notes: String },
    bmi:         Number,
    heightCm:    Number,
    weightKg:    Number,
  },
  { timestamps: true }
);

export const UserMedicalProfileModel = mongoose.model(
  "UserMedicalProfile",
  UserMedicalProfileSchema
);