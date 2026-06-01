import mongoose, { Document, Schema } from "mongoose";
import {
  WORKOUT_DAY_TYPE,
  WorkoutDayType,
  WORKOUT_DAY_STATUS,
  WorkoutDayStatus,
  WORKOUT_PLAN_STATUS,
  WorkoutPlanStatus,
  WORKOUT_EXERCISE_STATUS,
  WorkoutExerciseStatus,
} from "@/constants/fitness.constant";

//  WorkoutExercise

export interface IEmbeddedWorkoutExercise {
  exerciseId: mongoose.Types.ObjectId;
  exerciseTitle?: string;
  exerciseImage?: string;
  order: number;
  sets: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds: number;
  notes?: string;
  status?: WorkoutExerciseStatus;
  startedAt?: Date;
  timeTakenSeconds?: number;
}

const WorkoutExerciseSchema = new Schema<IEmbeddedWorkoutExercise>(
  {
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    exerciseTitle: { type: String },
    exerciseImage: { type: String },
    order: { type: Number, required: true },
    sets: { type: Number, required: true },
    reps: { type: Number },
    durationSeconds: { type: Number },
    restSeconds: { type: Number, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: Object.values(WORKOUT_EXERCISE_STATUS),
      default: WORKOUT_EXERCISE_STATUS.PENDING,
    },
    startedAt: { type: Date },
    timeTakenSeconds: { type: Number },
  },
  { _id: false },
);

// WorkoutDay 

export interface IEmbeddedWorkoutDay {
  dayNumber: number;
  dayName: string;
  type: WorkoutDayType;
  focus?: string;
  estimatedDurationMinutes?: number;
  status: WorkoutDayStatus;
  completedAt?: Date;
  exercises: IEmbeddedWorkoutExercise[];
}

const WorkoutDaySchema = new Schema<IEmbeddedWorkoutDay>(
  {
    dayNumber: { type: Number, required: true },
    dayName: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(WORKOUT_DAY_TYPE),
      required: true,
    },
    focus: { type: String },
    estimatedDurationMinutes: { type: Number },
    status: {
      type: String,
      enum: Object.values(WORKOUT_DAY_STATUS),
      required: true,
      default: WORKOUT_DAY_STATUS.PENDING,
    },
    completedAt: { type: Date },
    exercises: { type: [WorkoutExerciseSchema], default: [] },
  },
  { _id: false },
);

// WeekPlan embedded inside the user document

export interface IWeekPlan {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  status: WorkoutPlanStatus;
  workoutDays: IEmbeddedWorkoutDay[];
  createdAt?: Date;
}

const WeekPlanSchema = new Schema<IWeekPlan>(
  {
    weekNumber: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(WORKOUT_PLAN_STATUS),
      required: true,
    },
    workoutDays: { type: [WorkoutDaySchema], default: [] },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

// UserWorkoutPlan 
export interface IUserWorkoutPlanModel extends Document {
  userId: mongoose.Types.ObjectId;
  currentWeek: number;          
  weeks: IWeekPlan[];           
}

const UserWorkoutPlanSchema = new Schema<IUserWorkoutPlanModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,  
    },
    currentWeek: { type: Number, required: true, default: 0 },
    weeks: { type: [WeekPlanSchema], default: [] },
  },
  { timestamps: true },
);

export const UserWorkoutPlanModel = mongoose.model<IUserWorkoutPlanModel>(
  "UserWorkoutPlan",
  UserWorkoutPlanSchema,
);
