"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_repository_1 = require("./base/base.repository");
const exercise_model_1 = require("../models/exercise.model");
const mongoose_1 = __importDefault(require("mongoose"));
class ExerciseRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(exercise_model_1.ExerciseModel);
    }
    toInterface(doc) {
        return {
            _id: doc._id.toString(),
            key: doc.key,
            title: doc.title,
            description: doc.description || "",
            instructions: doc.instructions ?? [],
            media: {
                image: doc.media?.image || "",
                videoUrl: doc.media?.videoUrl,
            },
            categoryIds: doc.categoryIds?.map((id) => id.toString()) ?? [],
            targetMuscleIds: doc.targetMuscleIds?.map((id) => id.toString()) ?? [],
            equipmentIds: doc.equipmentIds?.map((id) => id.toString()) ?? [],
            targetMuscles: doc.targetMuscleIds?.map((m) => m.title || m.toString()) ?? [],
            equipment: doc.equipmentIds?.map((e) => e.title || e.toString()) ?? [],
            difficulty: doc.difficulty,
            workoutEnvironments: doc.workoutEnvironments ?? [],
            isCompound: doc.isCompound ?? false,
            isActive: doc.isActive ?? true,
        };
    }
    async createExercise(data) {
        return await this.create({ ...data });
    }
    async getAllExercises(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.title = { $regex: query.search, $options: "i" };
        }
        if (query.difficulty) {
            filter.difficulty = query.difficulty;
        }
        if (query.targetMuscleId) {
            filter.targetMuscleIds = new mongoose_1.default.Types.ObjectId(query.targetMuscleId);
        }
        if (query.categoryId) {
            filter.categoryIds = new mongoose_1.default.Types.ObjectId(query.categoryId);
        }
        if (query.status) {
            filter.isActive = query.status === "true";
        }
        const [docs, totalItems] = await Promise.all([
            this.model.find(filter)
                .populate("targetMuscleIds", "title")
                .populate("equipmentIds", "title")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.model.countDocuments(filter).exec(),
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        return {
            data: docs.map((doc) => this.toInterface(doc)),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
            },
        };
    }
    async getExerciseById(exerciseId) {
        const doc = await this.model.findById(exerciseId)
            .populate("targetMuscleIds", "title")
            .populate("equipmentIds", "title")
            .exec();
        return doc ? this.toInterface(doc) : null;
    }
    async updateExercise(exerciseId, data) {
        const updateData = { ...data };
        delete updateData["_id"];
        return await this.updateById(exerciseId, updateData);
    }
    async toggleExerciseStatus(exerciseId) {
        const existing = await this.model.findById(exerciseId).exec();
        if (!existing)
            return null;
        const doc = await this.model.findByIdAndUpdate(exerciseId, { $set: { isActive: !existing.isActive } }, { new: true }).exec();
        return doc ? this.toInterface(doc) : null;
    }
    async findExerciseByTitle(title) {
        return await this.findOne({ title });
    }
}
exports.default = ExerciseRepository;
