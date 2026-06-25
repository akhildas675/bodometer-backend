import mongoose, { Schema, Document } from "mongoose";

export interface IEmbeddedDietDay {
  dayNumber: number;
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  recommendedFoods: string;
}

export interface IUserDietPlan extends Document {
  userId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: string; // 'active', 'completed', 'cancelled'
  days: IEmbeddedDietDay[];
  createdAt: Date;
  updatedAt: Date;
}

const DietDaySchema = new Schema<IEmbeddedDietDay>({
  dayNumber: { type: Number, required: true },
  day: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  recommendedFoods: { type: String, required: true, default: "" },
}, { _id: false });

const UserDietPlanSchema = new Schema<IUserDietPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, default: "active" },
    days: [DietDaySchema],
  },
  { timestamps: true }
);

export const UserDietPlanModel = mongoose.model<IUserDietPlan>("UserDietPlan", UserDietPlanSchema);
