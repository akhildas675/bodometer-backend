"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionModel = void 0;
const question_constant_1 = require("../constants/question.constant");
const mongoose_1 = __importStar(require("mongoose"));
const QuestionSchema = new mongoose_1.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    question: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    groupId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "QuestionGroup",
        required: true,
    },
    order: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    type: {
        type: String,
        enum: question_constant_1.QUESTION_TYPES,
        required: true,
    },
    options: [
        {
            label: String,
            value: mongoose_1.Schema.Types.Mixed,
        },
    ],
    dataSource: {
        type: String,
        enum: question_constant_1.DATA_SOURCES,
    },
    next: [
        {
            condition: {
                operator: {
                    type: String,
                    enum: question_constant_1.CONDITION_OPERATORS,
                    default: "equals",
                },
                value: mongoose_1.Schema.Types.Mixed,
            },
            nextQuestionId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Question",
                required: true,
            },
        },
    ],
    numberConfig: {
        min: Number,
        max: Number,
        step: Number,
        unit: String,
    },
    validation: {
        required: {
            type: Boolean,
            default: false,
        },
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });
exports.QuestionModel = mongoose_1.default.model("Question", QuestionSchema);
