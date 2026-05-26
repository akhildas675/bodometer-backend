"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_repository_1 = require("./base/base.repository");
const target_muscle_model_1 = require("../models/target-muscle.model");
class TargetMuscleRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(target_muscle_model_1.TargetMuscleModel);
    }
    toInterface(doc) {
        return {
            _id: doc._id.toString(),
            key: doc.key,
            title: doc.title,
            description: doc.description,
            bodyRegion: doc.bodyRegion,
            image: doc.image,
            isActive: doc.isActive,
        };
    }
    async createTargetMuscle(data) {
        return await this.create({
            ...data
        });
    }
    async getAllTargetMuscles(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.title = { $regex: query.search, $options: "i" };
        }
        if (query.bodyRegion) {
            filter.bodyRegion = query.bodyRegion;
        }
        if (query.status) {
            filter.isActive = query.status === "true";
        }
        const [docs, totalItems] = await Promise.all([
            this.model.find(filter).skip(skip).limit(limit).exec(),
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
    async getTargetMuscleById(targetMuscleId) {
        return await this.findById(targetMuscleId);
    }
    async updateTargetMuscle(targetMuscleId, data) {
        const updateData = { ...data };
        delete updateData["_id"];
        return await this.updateById(targetMuscleId, updateData);
    }
    async toggleTargetMuscleStatus(targetMuscleId) {
        const existing = await this.model.findById(targetMuscleId).exec();
        if (!existing)
            return null;
        const doc = await this.model.findByIdAndUpdate(targetMuscleId, { $set: { isActive: !existing.isActive } }, { new: true }).exec();
        return doc ? this.toInterface(doc) : null;
    }
    async findTargetMuscleByTitle(title) {
        return await this.findOne({ title });
    }
}
exports.default = TargetMuscleRepository;
