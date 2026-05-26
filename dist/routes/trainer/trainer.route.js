"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trainer_routes_constant_1 = require("../../constants/routes.constant/trainer-routes.constant");
const role_guard_1 = require("../../constants/role.guard");
const trainer_module_1 = require("../../modules/trainer/trainer.module");
const multer_1 = require("../../config/multer");
const validate_1 = require("../../middleware/validate");
const trainer_validator_1 = require("../../validators/trainer/trainer.validator");
const trainerRoute = (0, express_1.Router)();
const { trainerController } = (0, trainer_module_1.createTrainerModule)();
trainerRoute.post(trainer_routes_constant_1.TRAINER_ROUTES.SUBMIT_PROFILE_DATA, role_guard_1.ROLE_GUARD.TRAINER_GUARD, multer_1.mediaUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
]), (0, validate_1.validate)(trainer_validator_1.createTrainerProfileSchema), trainerController.createProfile);
trainerRoute.get(trainer_routes_constant_1.TRAINER_ROUTES.GET_TRAINER_PROFILE, role_guard_1.ROLE_GUARD.TRAINER_GUARD, trainerController.getTrainer);
trainerRoute.put(trainer_routes_constant_1.TRAINER_ROUTES.TRAINER_PROFILE_UPDATE, role_guard_1.ROLE_GUARD.TRAINER_GUARD, (0, validate_1.validate)(trainer_validator_1.updateTrainerProfileSchema), trainerController.updateProfile);
trainerRoute.post(trainer_routes_constant_1.TRAINER_ROUTES.TRAINER_PROFILE_PICTURE_UPDATE, role_guard_1.ROLE_GUARD.TRAINER_GUARD, multer_1.mediaUpload.single("file"), (0, validate_1.validate)(trainer_validator_1.uploadProfilePictureSchema), trainerController.uploadProfilePicture);
trainerRoute.post(trainer_routes_constant_1.TRAINER_ROUTES.UPLOAD_DOCUMENT, role_guard_1.ROLE_GUARD.TRAINER_GUARD, multer_1.mediaUpload.single("file"), (0, validate_1.validate)(trainer_validator_1.uploadTrainerDocumentSchema), trainerController.uploadDocument);
trainerRoute.get(trainer_routes_constant_1.TRAINER_ROUTES.GET_PROFILE_STATUS, role_guard_1.ROLE_GUARD.TRAINER_GUARD, trainerController.getProfileStatus);
trainerRoute.get(trainer_routes_constant_1.TRAINER_ROUTES.GET_CATEGORIES, role_guard_1.ROLE_GUARD.TRAINER_GUARD, trainerController.getCategories);
exports.default = trainerRoute;
