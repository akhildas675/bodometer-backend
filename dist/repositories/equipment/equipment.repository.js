"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_repository_1 = require("../../repositories/base/base.repository");
const equipment_model_1 = require("../../models/equipment.model");
class EquipmentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(equipment_model_1.EquipmentModel);
    }
    toInterface(doc) {
        return {
            _id: doc._id.toString(),
            key: doc.key,
            title: doc.title,
            description: doc.description,
            image: doc.image,
            isActive: doc.isActive,
        };
    }
    async createEquipment(data) {
        return await this.create({
            ...data
        });
    }
    async getAllEquipment(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.title = { $regex: query.search, $options: "i" };
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
    async getEquipmentById(equipmentId) {
        return await this.findById(equipmentId);
    }
    async updateEquipment(equipmentId, data) {
        const updateData = { ...data };
        delete updateData["_id"];
        return await this.updateById(equipmentId, updateData);
    }
    async toggleEquipmentStatus(equipmentId) {
        const existing = await this.model.findById(equipmentId).exec();
        if (!existing)
            return null;
        const doc = await this.model.findByIdAndUpdate(equipmentId, { $set: { isActive: !existing.isActive } }, { new: true }).exec();
        return doc ? this.toInterface(doc) : null;
    }
    async findEquipmentByTitle(title) {
        return await this.findOne({ title });
    }
}
exports.default = EquipmentRepository;
