"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminModule = createAdminModule;
const admin_controller_1 = require("../../controllers/admin/admin.controller");
const trainer_profile_repository_1 = __importDefault(require("../../repositories/trainer/trainer-profile.repository"));
const user_repository_1 = __importDefault(require("../../repositories/user/user.repository"));
const admin_services_1 = require("../../services/admin/admin.services");
const s3_service_1 = require("../../services/s3/s3.service");
const category_repository_1 = __importDefault(require("../../repositories/category/category.repository"));
const subscription_feature_repository_1 = __importDefault(require("../../repositories/subscription/subscription-feature.repository"));
const subscription_plan_repository_1 = __importDefault(require("../../repositories/subscription/subscription-plan.repository"));
const group_repository_1 = __importDefault(require("../../repositories/onboarding/group.repository"));
const question_repository_1 = __importDefault(require("../../repositories/onboarding/question.repository"));
const target_muscle_repository_1 = __importDefault(require("../../repositories/target.muscle/target-muscle.repository"));
const equipment_repository_1 = __importDefault(require("../../repositories/equipment/equipment.repository"));
const exercise_repository_1 = __importDefault(require("../../repositories/exercise/exercise.repository"));
function createAdminModule() {
    const userRepository = new user_repository_1.default();
    const trainerProfileRepository = new trainer_profile_repository_1.default();
    const categoryRepository = new category_repository_1.default();
    const subscriptionFeatureRepository = new subscription_feature_repository_1.default();
    const subscriptionPlanRepository = new subscription_plan_repository_1.default();
    const groupRepository = new group_repository_1.default();
    const questionRepository = new question_repository_1.default();
    const targetMuscleRepository = new target_muscle_repository_1.default();
    const equipmentRepository = new equipment_repository_1.default();
    const exerciseRepository = new exercise_repository_1.default();
    const s3Service = new s3_service_1.S3Service();
    const adminService = new admin_services_1.AdminService(userRepository, trainerProfileRepository, s3Service, categoryRepository, subscriptionFeatureRepository, subscriptionPlanRepository, groupRepository, questionRepository, targetMuscleRepository, equipmentRepository, exerciseRepository);
    const adminController = new admin_controller_1.AdminController(adminService);
    return { adminController };
}
