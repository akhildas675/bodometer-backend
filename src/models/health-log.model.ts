import mongoose, { Document, Schema } from "mongoose";

// Embedded Meal

export interface IEmbeddedMeal {
    mealCategoryId: mongoose.Types.ObjectId;

    description: string;

    correctedMeal?: string;

    estimatedCalories?: number;

    estimatedProtein?: number;

    estimatedCarbs?: number;

    estimatedFat?: number;
}

const MealSchema = new Schema<IEmbeddedMeal>(
    {
        mealCategoryId: {
            type: Schema.Types.ObjectId,
            ref: "MealCategory",
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        correctedMeal: {
            type: String,
        },

        estimatedCalories: {
            type: Number,
            default: 0,
        },

        estimatedProtein: {
            type: Number,
            default: 0,
        },

        estimatedCarbs: {
            type: Number,
            default: 0,
        },

        estimatedFat: {
            type: Number,
            default: 0,
        },
    },
    { _id: false },
);

// Health Log

export interface IHealthLogModel extends Document {
    userId: mongoose.Types.ObjectId;

    date: Date;

    sleepHours?: number;

    waterLiters?: number;

    steps?: number;

    meals: IEmbeddedMeal[];
}

const HealthLogSchema = new Schema<IHealthLogModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },

        sleepHours: {
            type: Number,
        },

        waterLiters: {
            type: Number,
        },

        steps: {
            type: Number,
        },

        meals: {
            type: [MealSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    },
);



export const HealthLogModel = mongoose.model<IHealthLogModel>(
    "HealthLog",
    HealthLogSchema
);