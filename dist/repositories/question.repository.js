"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_repository_1 = require("./base/base.repository");
const question_model_1 = require("../models/question.model");
const mongoose_1 = __importDefault(require("mongoose"));
class QuestionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(question_model_1.QuestionModel);
    }
    toInterface(doc) {
        const isStepper = doc.type === "number" && doc.numberConfig;
        return {
            questionId: doc._id.toString(),
            id: doc._id.toString(),
            key: doc.key,
            schemaKey: null,
            isCoreLocked: false,
            question: doc.question,
            description: doc.description,
            groupId: doc.groupId.toString(),
            section: "",
            order: doc.order,
            isActive: doc.isActive,
            type: isStepper ? "number_stepper" : doc.type,
            options: doc.options?.map((o) => ({
                label: o.label,
                value: String(o.value ?? ""),
            })),
            dataSource: doc.dataSource,
            next: doc.next?.map((n) => ({
                condition: n.condition,
                nextQuestionId: n.nextQuestionId.toString(),
            })),
            numberConfig: doc.numberConfig,
            config: doc.numberConfig ? {
                min: doc.numberConfig.min,
                max: doc.numberConfig.max,
                step: doc.numberConfig.step,
                unit: doc.numberConfig.unit,
            } : undefined,
            validation: doc.validation,
            createdBy: doc.createdBy?.toString(),
            createdAt: doc.createdAt?.toISOString(),
        };
    }
    async createQuestion(data) {
        await question_model_1.QuestionModel.create({
            key: data.key,
            question: data.question,
            description: data.description,
            groupId: new mongoose_1.default.Types.ObjectId(data.groupId),
            order: data.order,
            isActive: data.isActive ?? true,
            type: data.type,
            options: data.options,
            dataSource: data.dataSource ? data.dataSource : undefined,
            next: data.next?.map((n) => ({
                condition: {
                    operator: n.condition.operator,
                    value: n.condition.value,
                },
                nextQuestionId: new mongoose_1.default.Types.ObjectId(n.nextQuestionId),
            })),
            numberConfig: data.numberConfig,
            validation: data.validation,
            createdBy: data.createdBy
                ? new mongoose_1.default.Types.ObjectId(data.createdBy)
                : undefined,
        });
    }
    async getQuestionById(questionId) {
        const doc = await question_model_1.QuestionModel.findById(questionId);
        return doc ? this.toInterface(doc) : null;
    }
    async updateQuestion(questionId, data) {
        const doc = await question_model_1.QuestionModel.findById(questionId);
        if (!doc)
            return;
        if (data.question !== undefined)
            doc.question = data.question;
        if (data.description !== undefined)
            doc.description = data.description;
        if (data.groupId !== undefined) {
            doc.groupId =
                data.groupId && mongoose_1.default.Types.ObjectId.isValid(data.groupId)
                    ? new mongoose_1.default.Types.ObjectId(data.groupId)
                    : undefined;
        }
        if (data.order !== undefined) {
            doc.order = Number(data.order);
            doc.markModified("order");
        }
        if (data.type !== undefined)
            doc.type = data.type;
        if (data.options !== undefined)
            doc.options = data.options;
        if (data.dataSource !== undefined)
            doc.dataSource = data.dataSource;
        if (data.next !== undefined) {
            doc.next = data.next?.map((n) => {
                const entry = {
                    condition: {
                        operator: n.condition.operator,
                        value: n.condition.value,
                    },
                };
                if (n.nextQuestionId &&
                    mongoose_1.default.Types.ObjectId.isValid(n.nextQuestionId)) {
                    entry.nextQuestionId = new mongoose_1.default.Types.ObjectId(n.nextQuestionId);
                }
                return entry;
            });
        }
        if (data.numberConfig !== undefined)
            doc.numberConfig = data.numberConfig;
        if (data.validation !== undefined)
            doc.validation = data.validation;
        await doc.save();
    }
    async getAllQuestions(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query.search) {
            filter.$or = [
                { question: { $regex: query.search, $options: "i" } },
                { key: { $regex: query.search, $options: "i" } },
            ];
        }
        if (query.groupId) {
            filter.groupId = new mongoose_1.default.Types.ObjectId(query.groupId);
        }
        if (query.isActive !== undefined) {
            filter.isActive = query.isActive === true ? { $ne: false } : false;
        }
        const sort = {};
        if (query.sortBy) {
            sort[query.sortBy] = query.sortOrder === "asc" ? 1 : -1;
        }
        else {
            sort.createdAt = -1;
        }
        const [docs, totalItems] = await Promise.all([
            question_model_1.QuestionModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
            question_model_1.QuestionModel.countDocuments(filter).exec(),
        ]);
        return {
            data: docs.map((doc) => this.toInterface(doc)),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit,
            },
        };
    }
    async getQuestionsByGroup(groupId, activeOnly = true) {
        const filter = {
            groupId: new mongoose_1.default.Types.ObjectId(groupId),
        };
        if (activeOnly)
            filter.isActive = true;
        const docs = await question_model_1.QuestionModel.find(filter).sort({ order: 1 }).exec();
        return docs.map((d) => this.toInterface(d));
    }
    async toggleQuestionStatus(questionId) {
        const existing = await question_model_1.QuestionModel.findById(questionId).exec();
        if (!existing)
            return null;
        const doc = await question_model_1.QuestionModel.findByIdAndUpdate(questionId, { $set: { isActive: !existing.isActive } }, { new: true }).exec();
        return doc ? this.toInterface(doc) : null;
    }
}
exports.default = QuestionRepository;
