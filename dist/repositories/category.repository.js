"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_repository_1 = require("./base/base.repository");
const category_model_1 = require("../models/category.model");
class CategoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(category_model_1.CategoryModel);
    }
    toInterface(doc) {
        return {
            categoryId: doc._id.toString(),
            name: doc.name,
            description: doc.description,
            media: {
                image: {
                    url: doc.media?.image?.url || "",
                },
            },
            isActive: doc.isActive,
        };
    }
    async createCategory(data) {
        await category_model_1.CategoryModel.create({
            name: data.name,
            description: data.description,
            media: {
                image: {
                    url: data.media.image.url,
                },
            },
            isActive: data.isActive ?? true,
        });
    }
    async getCategoryById(categoryId) {
        const doc = await category_model_1.CategoryModel.findById(categoryId);
        return doc ? this.toInterface(doc) : null;
    }
    async updateCategory(categoryId, data) {
        await category_model_1.CategoryModel.findByIdAndUpdate(categoryId, {
            name: data.name,
            description: data.description,
            media: {
                image: {
                    url: data.media.image.url,
                },
            },
        });
    }
    async getAllCategories(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.name = { $regex: query.search, $options: "i" };
        }
        if (query.isActive !== undefined) {
            filter.isActive = query.isActive === true ? { $ne: false } : false;
        }
        const [docs, totalItems] = await Promise.all([
            category_model_1.CategoryModel.find(filter).skip(skip).limit(limit).exec(),
            category_model_1.CategoryModel.countDocuments(filter).exec(),
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
    async toggleCategoryStatus(categoryId) {
        const existing = await category_model_1.CategoryModel.findById(categoryId).exec();
        if (!existing)
            return null;
        const doc = await category_model_1.CategoryModel.findByIdAndUpdate(categoryId, { $set: { isActive: !existing.isActive } }, { new: true }).exec();
        return doc ? this.toInterface(doc) : null;
    }
}
exports.default = CategoryRepository;
