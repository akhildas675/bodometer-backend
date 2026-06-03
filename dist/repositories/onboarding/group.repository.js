"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_repository_1 = require("../../repositories/base/base.repository");
const group_model_1 = require("../../models/group.model");
class GroupRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(group_model_1.GroupModel);
    }
    toInterface(doc) {
        return {
            groupId: doc._id.toString(),
            key: doc.key,
            title: doc.title,
            order: doc.order,
            isActive: doc.isActive,
            createdAt: doc.createdAt?.toISOString(),
        };
    }
    async createGroup(data) {
        await group_model_1.GroupModel.create({
            key: data.key,
            title: data.title,
            order: data.order,
            isActive: data.isActive ?? true,
        });
    }
    async getGroupById(groupId) {
        const doc = await group_model_1.GroupModel.findById(groupId);
        return doc ? this.toInterface(doc) : null;
    }
    async updateGroup(groupId, data) {
        await group_model_1.GroupModel.findByIdAndUpdate(groupId, {
            title: data.title,
            order: data.order,
        });
    }
    async getAllGroups(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.$or = [
                { title: { $regex: query.search, $options: "i" } },
                { key: { $regex: query.search, $options: "i" } },
            ];
        }
        if (query.isActive !== undefined) {
            filter.isActive = query.isActive === true ? { $ne: false } : false;
        }
        const [docs, totalItems] = await Promise.all([
            group_model_1.GroupModel.find(filter).sort({ order: 1 }).skip(skip).limit(limit).exec(),
            group_model_1.GroupModel.countDocuments(filter).exec(),
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
    async toggleGroupStatus(groupId) {
        const existing = await group_model_1.GroupModel.findById(groupId).exec();
        if (!existing)
            return null;
        const doc = await group_model_1.GroupModel.findByIdAndUpdate(groupId, { $set: { isActive: !existing.isActive } }, { new: true }).exec();
        return doc ? this.toInterface(doc) : null;
    }
}
exports.default = GroupRepository;
