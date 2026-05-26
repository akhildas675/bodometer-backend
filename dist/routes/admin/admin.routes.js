"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_routes_constant_1 = require("../../constants/routes.constant/admin-routes.constant");
const admin_module_1 = require("../../modules/admin/admin.module");
const role_guard_1 = require("../../constants/role.guard");
const multer_1 = require("../../config/multer");
const admin_validator_1 = require("../../validators/admin/admin-validator");
const validate_1 = require("../../middleware/validate");
const adminRoute = (0, express_1.Router)();
const { adminController } = (0, admin_module_1.createAdminModule)();
// Trainer Management
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_TRAINERS, role_guard_1.ROLE_GUARD.ADMIN_GUARD, (0, validate_1.validate)(admin_validator_1.getTrainersSchema), adminController.getTrainers);
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.BLOCK_TRAINER, role_guard_1.ROLE_GUARD.ADMIN_GUARD, (0, validate_1.validate)(admin_validator_1.trainerIdParamSchema), adminController.blockTrainer);
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.UNBLOCK_TRAINER, role_guard_1.ROLE_GUARD.ADMIN_GUARD, (0, validate_1.validate)(admin_validator_1.trainerIdParamSchema), adminController.unblockTrainer);
// Trainer Appointment Management
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_TRAINER_APPOINTMENTS, role_guard_1.ROLE_GUARD.ADMIN_GUARD, (0, validate_1.validate)(admin_validator_1.getTrainerAppointmentsSchema), adminController.getTrainerAppointments);
// Get Trainer by ProfileId
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_TRAINER_BY_ID, role_guard_1.ROLE_GUARD.ADMIN_GUARD, (0, validate_1.validate)(admin_validator_1.profileIdParamSchema), adminController.getTrainerById);
// Approve Trainer
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.APPROVE_TRAINER, role_guard_1.ROLE_GUARD.ADMIN_GUARD, (0, validate_1.validate)(admin_validator_1.profileIdParamSchema), adminController.approveTrainer);
// Reject Trainer
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.REJECT_TRAINER, role_guard_1.ROLE_GUARD.ADMIN_GUARD, (0, validate_1.validate)(admin_validator_1.rejectTrainerSchema), adminController.rejectTrainer);
// User Management
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_USERS, role_guard_1.ROLE_GUARD.ADMIN_GUARD, (0, validate_1.validate)(admin_validator_1.getUsersSchema), adminController.getUsers);
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.BLOCK_USER, role_guard_1.ROLE_GUARD.ADMIN_GUARD, (0, validate_1.validate)(admin_validator_1.userIdParamSchema), adminController.blockUser);
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.UNBLOCK_USER, role_guard_1.ROLE_GUARD.ADMIN_GUARD, (0, validate_1.validate)(admin_validator_1.userIdParamSchema), adminController.unblockUser);
adminRoute.post(admin_routes_constant_1.ADMIN_ROUTES.CREATE_CATEGORY, role_guard_1.ROLE_GUARD.ADMIN_GUARD, multer_1.mediaUpload.single("image"), (0, validate_1.validate)(admin_validator_1.categoryValidationSchema), adminController.createCategory);
adminRoute.put(admin_routes_constant_1.ADMIN_ROUTES.UPDATE_CATEGORY, role_guard_1.ROLE_GUARD.ADMIN_GUARD, multer_1.mediaUpload.single("image"), (0, validate_1.validate)(admin_validator_1.categoryUpdateSchema), adminController.updateCategory);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_CATEGORY_BY_ID, role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getCategoryById);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_ALL_CATEGORIES, role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getAllCategories);
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.TOGGLE_CATEGORY_STATUS, role_guard_1.ROLE_GUARD.ADMIN_GUARD, (0, validate_1.validate)(admin_validator_1.categoryIdParamSchema), adminController.toggleCategoryStatus);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_ALL_FEATURES, role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getAllSubscriptionFeatures);
adminRoute.post(admin_routes_constant_1.ADMIN_ROUTES.CREATE_FEATURE, (0, validate_1.validate)(admin_validator_1.featureValidationSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.createSubscriptionFeature);
adminRoute.put(admin_routes_constant_1.ADMIN_ROUTES.UPDATE_FEATURE, (0, validate_1.validate)(admin_validator_1.featureUpdateSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.updateSubscriptionFeature);
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.TOGGLE_FEATURE_STATUS, (0, validate_1.validate)(admin_validator_1.featureIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.toggleSubscriptionFeatureStatus);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_FEATURE_BY_ID, role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getSubscriptionFeatureById);
adminRoute.post(admin_routes_constant_1.ADMIN_ROUTES.CREATE_SUBSCRIPTION_PLAN, (0, validate_1.validate)(admin_validator_1.subscriptionPlanValidationSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.createSubscriptionPlan);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_ALL_SUBSCRIPTION_PLANS, role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getAllSubscriptionPlans);
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.TOGGLE_SUBSCRIPTION_PLAN_STATUS, (0, validate_1.validate)(admin_validator_1.subscriptionPlanIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.toggleSubscriptionPlanStatus);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_SUBSCRIPTION_PLAN_BY_ID, (0, validate_1.validate)(admin_validator_1.subscriptionPlanIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getSubscriptionPlanById);
adminRoute.put(admin_routes_constant_1.ADMIN_ROUTES.UPDATE_SUBSCRIPTION_PLAN, (0, validate_1.validate)(admin_validator_1.subscriptionPlanUpdateSchema.merge(admin_validator_1.subscriptionPlanIdParamSchema)), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.updateSubscriptionPlan);
// Question Group Routes
adminRoute.post(admin_routes_constant_1.ADMIN_ROUTES.CREATE_QUESTION_GROUP, role_guard_1.ROLE_GUARD.ADMIN_GUARD, (0, validate_1.validate)(admin_validator_1.groupValidationSchema), adminController.createQuestionGroup);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_ALL_QUESTION_GROUPS, role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getAllQuestionGroups);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_QUESTION_GROUP_BY_ID, (0, validate_1.validate)(admin_validator_1.groupIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getQuestionGroupById);
adminRoute.put(admin_routes_constant_1.ADMIN_ROUTES.UPDATE_QUESTION_GROUP, (0, validate_1.validate)(admin_validator_1.groupUpdateSchema.merge(admin_validator_1.groupIdParamSchema)), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.updateQuestionGroup);
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.TOGGLE_QUESTION_GROUP_STATUS, (0, validate_1.validate)(admin_validator_1.groupIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.toggleQuestionGroupStatus);
// Question Routes
adminRoute.post(admin_routes_constant_1.ADMIN_ROUTES.CREATE_QUESTION, (0, validate_1.validate)(admin_validator_1.questionValidationSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.createQuestion);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_ALL_QUESTIONS, role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getAllQuestions);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_QUESTION_BY_ID, (0, validate_1.validate)(admin_validator_1.questionIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getQuestionById);
adminRoute.put(admin_routes_constant_1.ADMIN_ROUTES.UPDATE_QUESTION, (0, validate_1.validate)(admin_validator_1.questionUpdateSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.updateQuestion);
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.TOGGLE_QUESTION_STATUS, (0, validate_1.validate)(admin_validator_1.questionIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.toggleQuestionStatus);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_QUESTION_DATA_SOURCES, role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getQuestionDataSources);
// Subscription Transactions
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_ALL_SUBSCRIPTION_TRANSACTIONS, role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getAllSubscriptionTransactions);
//Target Muscles
adminRoute.post(admin_routes_constant_1.ADMIN_ROUTES.CREATE_TARGET_MUSCLE, multer_1.mediaUpload.single("image"), (0, validate_1.validate)(admin_validator_1.createTargetMuscleSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.createTargetMuscle);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_ALL_TARGET_MUSCLES, role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getAllTargetMuscles);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_TARGET_MUSCLE_BY_ID, (0, validate_1.validate)(admin_validator_1.targetMuscleIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getTargetMuscleById);
adminRoute.put(admin_routes_constant_1.ADMIN_ROUTES.UPDATE_TARGET_MUSCLE, multer_1.mediaUpload.single("image"), (0, validate_1.validate)(admin_validator_1.updateTargetMuscleSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.updateTargetMuscle);
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.TOGGLE_TARGET_MUSCLE_STATUS, (0, validate_1.validate)(admin_validator_1.targetMuscleIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.toggleTargetMuscleStatus);
// Equipment
adminRoute.post(admin_routes_constant_1.ADMIN_ROUTES.CREATE_EQUIPMENT, multer_1.mediaUpload.single("image"), (0, validate_1.validate)(admin_validator_1.createEquipmentSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.createEquipment);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_ALL_EQUIPMENT, role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getAllEquipment);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_EQUIPMENT_BY_ID, (0, validate_1.validate)(admin_validator_1.equipmentIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getEquipmentById);
adminRoute.put(admin_routes_constant_1.ADMIN_ROUTES.UPDATE_EQUIPMENT, multer_1.mediaUpload.single("image"), (0, validate_1.validate)(admin_validator_1.updateEquipmentSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.updateEquipment);
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.TOGGLE_EQUIPMENT_STATUS, (0, validate_1.validate)(admin_validator_1.equipmentIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.toggleEquipmentStatus);
// Exercises
adminRoute.post(admin_routes_constant_1.ADMIN_ROUTES.CREATE_EXERCISE, multer_1.mediaUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 }
]), (0, validate_1.validate)(admin_validator_1.createExerciseSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.createExercise);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_ALL_EXERCISES, (0, validate_1.validate)(admin_validator_1.getAllExercisesSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getAllExercises);
adminRoute.get(admin_routes_constant_1.ADMIN_ROUTES.GET_EXERCISE_BY_ID, (0, validate_1.validate)(admin_validator_1.exerciseIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.getExerciseById);
adminRoute.put(admin_routes_constant_1.ADMIN_ROUTES.UPDATE_EXERCISE, multer_1.mediaUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 }
]), (0, validate_1.validate)(admin_validator_1.updateExerciseSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.updateExercise);
adminRoute.patch(admin_routes_constant_1.ADMIN_ROUTES.TOGGLE_EXERCISE_STATUS, (0, validate_1.validate)(admin_validator_1.exerciseIdParamSchema), role_guard_1.ROLE_GUARD.ADMIN_GUARD, adminController.toggleExerciseStatus);
exports.default = adminRoute;
