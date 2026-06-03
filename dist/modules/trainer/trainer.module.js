"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrainerModule = createTrainerModule;
const trainer_controller_1 = require("../../controllers/trainer/trainer.controller");
const trainer_profile_repository_1 = __importDefault(require("../../repositories/trainer/trainer-profile.repository"));
const user_repository_1 = __importDefault(require("../../repositories/user/user.repository"));
const s3_service_1 = require("../../services/s3/s3.service");
const trainer_services_1 = require("../../services/trainer/trainer.services");
const category_repository_1 = __importDefault(require("../../repositories/category/category.repository"));
function createTrainerModule() {
    const userRepository = new user_repository_1.default();
    const trainerProfileRepository = new trainer_profile_repository_1.default();
    const s3Service = new s3_service_1.S3Service();
    const categoryRepository = new category_repository_1.default();
    const trainerService = new trainer_services_1.TrainerService(userRepository, trainerProfileRepository, s3Service, categoryRepository);
    const trainerController = new trainer_controller_1.TrainerController(trainerService);
    return { trainerController };
}
