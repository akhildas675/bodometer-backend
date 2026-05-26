"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
const base_repository_1 = require("./base/base.repository");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(user_model_1.UserModel);
    }
    toInterface(doc) {
        return {
            id: doc._id.toString(),
            name: doc.name,
            userName: doc.userName ?? "",
            email: doc.email,
            phoneNumber: doc.phoneNumber ?? null,
            password: doc.password,
            profilePic: doc.profilePic ?? null,
            role: doc.role,
            isVerified: doc.isVerified,
            isBlocked: doc.isBlocked,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
    // Auth
    async findByEmail(email) {
        return this.findOne({ email });
    }
    async findByUsername(username) {
        return this.findOne({ userName: username });
    }
    async updatePassword(userId, password) {
        await user_model_1.UserModel.updateOne({ _id: userId }, { $set: { password } });
    }
    async updateVerified(userId, isVerified) {
        await user_model_1.UserModel.updateOne({ _id: userId }, { $set: { isVerified } });
    }
    // Profile (user & trainer)
    async updateProfile(userId, updateData) {
        const updateFields = {};
        if (updateData.name !== undefined)
            updateFields.name = updateData.name;
        if (updateData.userName !== undefined)
            updateFields.userName = updateData.userName;
        if (updateData.phoneNumber !== undefined)
            updateFields.phoneNumber = updateData.phoneNumber;
        if (updateData.profilePic !== undefined)
            updateFields.profilePic = updateData.profilePic;
        return this.updateById(userId, updateFields);
    }
    //admin paginated list by role
    async findByRolePaginated(role, search, sortBy, sortOrder, page, limit) {
        const filter = { role };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === "desc" ? -1 : 1;
        }
        else {
            sort.createdAt = -1;
        }
        const pageNum = page || 1;
        const limitNum = limit || 10;
        const skip = (pageNum - 1) * limitNum;
        const total = await this.countDocuments({ role });
        const docs = await user_model_1.UserModel.find(filter)
            .select("-password")
            .sort(sort)
            .skip(skip)
            .limit(limitNum);
        return {
            data: docs.map((doc) => this.toInterface(doc)),
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum,
            },
        };
    }
    //  block / unblock
    async updateBlockStatus(userId, isBlocked) {
        await user_model_1.UserModel.updateOne({ _id: userId }, { $set: { isBlocked } });
    }
}
exports.default = UserRepository;
