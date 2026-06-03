"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB(mongoUri) {
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log('Mongoose Connected!');
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
    }
}
