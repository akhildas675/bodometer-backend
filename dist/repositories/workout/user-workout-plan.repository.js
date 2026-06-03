"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserWorkoutPlanRepository = void 0;
const user_workout_plan_model_1 = require("../../models/user.workout-plan.model");
const mongoose_1 = __importDefault(require("mongoose"));
const fitness_constant_1 = require("../../constants/fitness.constant");
class UserWorkoutPlanRepository {
    async createWeek(userId, week) {
        const doc = await user_workout_plan_model_1.UserWorkoutPlanModel.create({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            ...week
        });
        return doc;
    }
    async findAllByUserId(userId) {
        return user_workout_plan_model_1.UserWorkoutPlanModel.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
        }).sort({ weekNumber: 1 });
    }
    async findActiveWeekByUserId(userId) {
        return user_workout_plan_model_1.UserWorkoutPlanModel.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            status: fitness_constant_1.WORKOUT_PLAN_STATUS.ACTIVE,
        });
    }
    async expireActiveWeeks(userId) {
        await user_workout_plan_model_1.UserWorkoutPlanModel.updateMany({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            status: fitness_constant_1.WORKOUT_PLAN_STATUS.ACTIVE
        }, {
            $set: { status: fitness_constant_1.WORKOUT_PLAN_STATUS.EXPIRED },
        });
    }
    async saveWeek(weekDoc) {
        weekDoc.markModified("workoutDays");
        return await weekDoc.save();
    }
}
exports.UserWorkoutPlanRepository = UserWorkoutPlanRepository;
