"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const messages_1 = require("../../constants/messages");
const roles_1 = require("../../constants/roles");
const statuscode_1 = require("../../constants/statuscode");
const verification_constants_1 = require("../../constants/verification.constants");
const admin_mappers_1 = require("../../mappers/admin/admin.mappers");
const category_mapper_1 = require("../../mappers/category/category.mapper");
const subscription_mapper_1 = require("../../mappers/subscription/subscription.mapper");
const appError_1 = require("../../utils/appError");
const string_formatters_1 = require("../../utils/string-formatters");
const subscription_transaction_repository_1 = require("../../repositories/subscription-transaction.repository");
const question_constant_1 = require("../../constants/question.constant");
const target_muscles_mapper_1 = require("../../mappers/target.muscles/target-muscles.mapper");
const equipment_mapper_1 = require("../../mappers/equipment/equipment.mapper");
const exercise_mapper_1 = require("../../mappers/exercise/exercise.mapper");
class AdminService {
    _userRepository;
    _trainerProfileRepository;
    _s3Service;
    _categoryRepository;
    _subscriptionFeatureRepository;
    _subscriptionPlanRepository;
    _groupRepository;
    _questionRepository;
    _targetMuscleRepository;
    _equipmentRepository;
    _exerciseRepository;
    _subscriptionTransactionRepository = new subscription_transaction_repository_1.SubscriptionTransactionRepository();
    constructor(_userRepository, _trainerProfileRepository, _s3Service, _categoryRepository, _subscriptionFeatureRepository, _subscriptionPlanRepository, _groupRepository, _questionRepository, _targetMuscleRepository, _equipmentRepository, _exerciseRepository) {
        this._userRepository = _userRepository;
        this._trainerProfileRepository = _trainerProfileRepository;
        this._s3Service = _s3Service;
        this._categoryRepository = _categoryRepository;
        this._subscriptionFeatureRepository = _subscriptionFeatureRepository;
        this._subscriptionPlanRepository = _subscriptionPlanRepository;
        this._groupRepository = _groupRepository;
        this._questionRepository = _questionRepository;
        this._targetMuscleRepository = _targetMuscleRepository;
        this._equipmentRepository = _equipmentRepository;
        this._exerciseRepository = _exerciseRepository;
    }
    //  Users
    async fetchUsers(query) {
        const { data, pagination } = await this._userRepository.findByRolePaginated(roles_1.ROLES.USER, query.search, query.sortBy, query.sortOrder, query.page, query.limit);
        const page = query.page || 1;
        const limit = query.limit || 10;
        const totalPages = Math.ceil(pagination.totalItems / limit);
        return {
            data: admin_mappers_1.AdminAccountMapper.toResponseList(data),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: pagination.totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
    async blockUser(userId) {
        if (!userId)
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.ID_REQUIRED);
        await this._userRepository.updateBlockStatus(userId, true);
    }
    async unblockUser(userId) {
        if (!userId)
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.ID_REQUIRED);
        await this._userRepository.updateBlockStatus(userId, false);
    }
    //Trainers
    async fetchTrainers(query) {
        const { data, pagination } = await this._userRepository.findByRolePaginated(roles_1.ROLES.TRAINER, query.search, query.sortBy, query.sortOrder, query.page, query.limit);
        const page = query.page || 1;
        const limit = query.limit || 10;
        const totalPages = Math.ceil(pagination.totalItems / limit);
        return {
            data: admin_mappers_1.AdminAccountMapper.toResponseList(data),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: pagination.totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
    async blockTrainer(trainerId) {
        if (!trainerId)
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.ID_REQUIRED);
        await this._userRepository.updateBlockStatus(trainerId, true);
    }
    async unblockTrainer(trainerId) {
        if (!trainerId)
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.ID_REQUIRED);
        await this._userRepository.updateBlockStatus(trainerId, false);
    }
    async getTrainerAppointments(query) {
        const { data, pagination } = await this._trainerProfileRepository.findAllWithUserPaginated(query.search, query.sortBy, query.sortOrder, query.page, query.limit, query.status);
        return {
            data: admin_mappers_1.TrainerMapper.toDtoArray(data),
            pagination,
        };
    }
    async getTrainerByProfileId(profileId) {
        const trainer = await this._trainerProfileRepository.findByIdWithUser(profileId);
        if (!trainer)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.TRAINER.NOT_FOUND);
        return admin_mappers_1.TrainerMapper.toDetailDto(trainer);
    }
    async approveTrainer(profileId) {
        const profile = await this._trainerProfileRepository.findById(profileId);
        if (!profile)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND);
        if (profile.verificationStatus === verification_constants_1.VERIFICATION_STATUS.APPROVED) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.ADMIN.VERIFICATION_APPROVED_EXISTS);
        }
        const updated = await this._trainerProfileRepository.updateVerificationStatus(profileId, verification_constants_1.VERIFICATION_STATUS.APPROVED, null);
        if (!updated)
            throw new appError_1.AppError(statuscode_1.STATUS.INTERNAL_ERROR, messages_1.MESSAGES.ADMIN.VERIFICATION_APPROVED_FAILED);
        return admin_mappers_1.TrainerMapper.toApproveDto(updated);
    }
    async rejectTrainer(profileId, reason) {
        if (!reason?.trim()) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD);
        }
        const profile = await this._trainerProfileRepository.findById(profileId);
        if (!profile)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND);
        const updated = await this._trainerProfileRepository.updateVerificationStatus(profileId, verification_constants_1.VERIFICATION_STATUS.REJECTED, reason);
        if (!updated)
            throw new appError_1.AppError(statuscode_1.STATUS.INTERNAL_ERROR, messages_1.MESSAGES.ADMIN.TRAINER_FAILED_TO_REJECTED);
        return admin_mappers_1.TrainerMapper.toRejectDto(updated);
    }
    async createCategory(data) {
        if (!data.image) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.ADMIN.CATEGORY_CREATION_FAILED);
        }
        const imageUrl = await this._s3Service.uploadFile(data.image, data.name);
        const categoryData = {
            name: data.name,
            description: data.description,
            media: { image: { url: imageUrl } },
            isActive: true,
        };
        await this._categoryRepository.createCategory(categoryData);
    }
    async getCategoryById(categoryId) {
        const category = await this._categoryRepository.getCategoryById(categoryId);
        if (!category) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.ADMIN.CATEGORY_NOT_FOUND);
        }
        return category_mapper_1.CategoryMappers.toGetCategoryByIdResponseDto(category);
    }
    async updateCategory(data) {
        if (!data.categoryId) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.ADMIN.CATEGORY_CREATION_FAILED || "Category ID is required");
        }
        if (!data.name) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.ADMIN.CATEGORY_CREATION_FAILED || "Name is required");
        }
        if (!data.description) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.ADMIN.CATEGORY_CREATION_FAILED || "Description is required");
        }
        const category = await this._categoryRepository.getCategoryById(data.categoryId);
        if (!category) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.ADMIN.CATEGORY_NOT_FOUND || "Category not found");
        }
        let imageUrl = category.media.image.url;
        if (data.image) {
            imageUrl = await this._s3Service.uploadFile(data.image, data.name);
        }
        const categoryData = {
            name: data.name,
            description: data.description,
            media: { image: { url: imageUrl } },
        };
        await this._categoryRepository.updateCategory(data.categoryId, categoryData);
    }
    async getAllCategories(query) {
        const { data, pagination } = await this._categoryRepository.getAllCategories({
            search: query.search,
            page: query.page,
            limit: query.limit,
        });
        return {
            data: category_mapper_1.CategoryMappers.toCategoryResponseDtoList(data),
            pagination,
        };
    }
    async toggleCategoryStatus(categoryId) {
        const category = await this._categoryRepository.getCategoryById(categoryId);
        if (!category) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.ADMIN.CATEGORY_NOT_FOUND || "Category not found");
        }
        const updated = await this._categoryRepository.toggleCategoryStatus(categoryId);
        if (!updated) {
            throw new appError_1.AppError(statuscode_1.STATUS.INTERNAL_ERROR, messages_1.MESSAGES.ADMIN.CATEGORY_CREATION_FAILED ||
                "Failed to toggle category status");
        }
        return {
            message: messages_1.MESSAGES.ADMIN.CATEGORY_STATUS_TOGGLED,
            category: category_mapper_1.CategoryMappers.toCategoryResponseDto(updated),
        };
    }
    async getAllSubscriptionFeatures(query) {
        const { data, pagination } = await this._subscriptionFeatureRepository.getAllSubscriptionFeatures({
            search: query.search,
            page: query.page,
            limit: query.limit,
        });
        return {
            data: subscription_mapper_1.SubscriptionMapper.toFeatureDtoList(data),
            pagination,
        };
    }
    async createSubscriptionFeature(data) {
        const generateFeatureKey = (title) => {
            return title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_|_$/g, "");
        };
        const featureData = {
            key: generateFeatureKey(data.title),
            title: data.title,
            description: data.description,
            type: data.type,
        };
        await this._subscriptionFeatureRepository.createSubscriptionFeature(featureData);
    }
    async updateSubscriptionFeature(data) {
        if (!data.subscriptionFeatureId) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION?.ID_REQUIRED ||
                "Subscription Feature ID is required");
        }
        const updated = await this._subscriptionFeatureRepository.updateSubscriptionFeature(data.subscriptionFeatureId, {
            title: data.title,
            description: data.description,
            type: data.type,
        });
        if (!updated) {
            throw new appError_1.AppError(statuscode_1.STATUS.INTERNAL_ERROR, messages_1.MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATION_FAILED ||
                "Failed to update subscription feature");
        }
    }
    async toggleSubscriptionFeatureStatus(subscriptionFeatureId) {
        const updated = await this._subscriptionFeatureRepository.toggleSubscriptionFeatureStatus(subscriptionFeatureId);
        if (!updated) {
            throw new appError_1.AppError(statuscode_1.STATUS.INTERNAL_ERROR, messages_1.MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATION_FAILED ||
                "Failed to toggle subscription feature status");
        }
        return {
            message: messages_1.MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_STATUS_TOGGLED,
            feature: subscription_mapper_1.SubscriptionMapper.toFeatureDto(updated),
        };
    }
    async getSubscriptionFeatureById(subscriptionFeatureId) {
        const feature = await this._subscriptionFeatureRepository.getSubscriptionFeatureById(subscriptionFeatureId);
        if (!feature) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATION_FAILED ||
                "Subscription feature not found");
        }
        return subscription_mapper_1.SubscriptionMapper.toFeatureDto(feature);
    }
    async createSubscriptionPlan(data) {
        const planData = {
            name: data.name,
            description: data.description,
            price: data.price,
            durationInDays: data.durationInDays,
            features: data.features,
            isPopular: data.isPopular ?? false,
        };
        await this._subscriptionPlanRepository.createSubscriptionPlan(planData);
    }
    async getAllSubscriptionPlans(query) {
        const { data, pagination } = await this._subscriptionPlanRepository.getAllSubscriptionPlans({
            search: query.search,
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });
        return {
            data: subscription_mapper_1.SubscriptionMapper.toPlanDtoList(data),
            pagination,
        };
    }
    async getSubscriptionPlanById(subscriptionPlanId) {
        const plan = await this._subscriptionPlanRepository.getSubscriptionPlanById(subscriptionPlanId);
        if (!plan) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.ADMIN.SUBSCRIPTION_PLAN_FETCH_FAILED ||
                "Subscription plan not found");
        }
        return subscription_mapper_1.SubscriptionMapper.toPlanByIdResponseDto(plan);
    }
    async updateSubscriptionPlan(data) {
        if (!data.subscriptionPlanId) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION?.ID_REQUIRED || "Subscription plan ID is required");
        }
        const updated = await this._subscriptionPlanRepository.updateSubscriptionPlan(data.subscriptionPlanId, {
            name: data.name,
            description: data.description,
            price: data.price,
            durationInDays: data.durationInDays,
            isPopular: data.isPopular,
            isActive: data.isActive,
            features: data.features,
        });
        if (!updated) {
            throw new appError_1.AppError(statuscode_1.STATUS.INTERNAL_ERROR, messages_1.MESSAGES.ADMIN.SUBSCRIPTION_PLAN_UPDATE_FAILED ||
                "Failed to update subscription plan");
        }
    }
    async toggleSubscriptionPlanStatus(subscriptionPlanId) {
        const updated = await this._subscriptionPlanRepository.toggleSubscriptionPlanStatus(subscriptionPlanId);
        if (!updated) {
            throw new appError_1.AppError(statuscode_1.STATUS.INTERNAL_ERROR, messages_1.MESSAGES.ADMIN.SUBSCRIPTION_PLAN_TOGGLE_FAILED ||
                "Failed to toggle subscription plan status");
        }
        return {
            message: messages_1.MESSAGES.ADMIN.SUBSCRIPTION_PLAN_TOGGLED,
            plan: subscription_mapper_1.SubscriptionMapper.toPlanDto(updated),
        };
    }
    // Question Groups
    async createQuestionGroup(data) {
        await this._groupRepository.createGroup({
            key: (0, string_formatters_1.generateKeySlug)(data.title),
            title: data.title,
            order: data.order,
        });
    }
    async getAllQuestionGroups(query) {
        const result = await this._groupRepository.getAllGroups(query);
        return {
            data: result.data.map((g) => ({
                groupId: g.groupId,
                key: g.key,
                title: g.title,
                order: g.order,
                isActive: g.isActive ?? true,
            })),
            pagination: result.pagination,
        };
    }
    async getQuestionGroupById(groupId) {
        const group = await this._groupRepository.getGroupById(groupId);
        if (!group)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, "Group not found");
        return {
            groupId: group.groupId,
            key: group.key,
            title: group.title,
            order: group.order,
            isActive: group.isActive ?? true,
        };
    }
    async updateQuestionGroup(groupId, data) {
        await this._groupRepository.updateGroup(groupId, {
            title: data.title,
            order: data.order,
            key: "",
        });
    }
    async toggleQuestionGroupStatus(groupId) {
        await this._groupRepository.toggleGroupStatus(groupId);
    }
    // Questions
    async createQuestion(data, adminId) {
        const options = data.dataSource === "category" || data.dataSource === "equipment"
            ? []
            : data.options?.map((o) => ({
                label: o.label.trim(),
                value: (0, string_formatters_1.generateOptionValue)(o.label),
            }));
        await this._questionRepository.createQuestion({
            ...data,
            key: (0, string_formatters_1.generateKeySlug)(data.question),
            createdBy: adminId,
            options,
        });
    }
    async getAllQuestions(query) {
        const result = await this._questionRepository.getAllQuestions(query);
        return {
            data: result.data.map((q) => ({
                questionId: q.questionId,
                key: q.key,
                question: q.question,
                description: q.description,
                groupId: q.groupId,
                order: q.order,
                isActive: q.isActive ?? true,
                type: q.type,
                options: q.options,
                dataSource: q.dataSource,
                next: q.next,
                numberConfig: q.numberConfig,
                validation: q.validation,
                createdAt: q.createdAt,
            })),
            pagination: result.pagination,
        };
    }
    async getQuestionById(questionId) {
        const q = await this._questionRepository.getQuestionById(questionId);
        if (!q)
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, "Question not found");
        return {
            questionId: q.questionId,
            key: q.key,
            question: q.question,
            description: q.description,
            groupId: q.groupId,
            order: q.order,
            isActive: q.isActive ?? true,
            type: q.type,
            options: q.options,
            dataSource: q.dataSource,
            next: q.next,
            numberConfig: q.numberConfig,
            validation: q.validation,
            createdAt: q.createdAt,
        };
    }
    async updateQuestion(questionId, data) {
        const options = data.dataSource === "category" || data.dataSource === "equipment"
            ? []
            : data.options?.map((o) => ({
                label: o.label.trim(),
                value: (0, string_formatters_1.generateOptionValue)(o.label),
            }));
        await this._questionRepository.updateQuestion(questionId, {
            ...data,
            options,
        });
    }
    async toggleQuestionStatus(questionId) {
        await this._questionRepository.toggleQuestionStatus(questionId);
    }
    async getAllSubscriptionTransactions(query) {
        const { data, pagination } = await this._subscriptionTransactionRepository.findAllPaginated(query.search, query.sortBy, query.sortOrder, query.page, query.limit, query.status);
        return {
            data: subscription_mapper_1.SubscriptionMapper.toTransactionDtoList(data),
            pagination,
        };
    }
    getQuestionDataSources() {
        const labels = {
            category: "Workout Categories",
            equipment: "Workout Equipment",
        };
        return Promise.resolve(question_constant_1.DATA_SOURCES.map((source) => ({
            value: source,
            label: labels[source] || source.charAt(0).toUpperCase() + source.slice(1),
        })));
    }
    //Target Muscles
    async createTargetMuscle(data) {
        if (!data.image) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.IMAGE_REQUIRED);
        }
        const key = (0, string_formatters_1.generateKeySlug)(data.title);
        const imageUrl = await this._s3Service.uploadFile(data.image, `target-muscles/${key}`);
        const targetMuscleData = {
            key: key,
            title: data.title,
            image: imageUrl,
            description: data.description,
            bodyRegion: data.bodyRegion,
        };
        await this._targetMuscleRepository.createTargetMuscle(targetMuscleData);
    }
    async getAllTargetMuscles(query) {
        const { data, pagination } = await this._targetMuscleRepository.getAllTargetMuscles(query);
        return {
            data: target_muscles_mapper_1.TargetMuscleMapper.toTargetMuscleDtoList(data),
            pagination,
        };
    }
    async getTargetMuscleById(targetMuscleId) {
        const targetMuscle = await this._targetMuscleRepository.getTargetMuscleById(targetMuscleId);
        if (!targetMuscle) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.VALIDATION.INVALID_ID);
        }
        return target_muscles_mapper_1.TargetMuscleMapper.toTargetMuscleDto(targetMuscle);
    }
    async updateTargetMuscle(targetMuscleId, data) {
        const targetMuscle = await this._targetMuscleRepository.getTargetMuscleById(targetMuscleId);
        if (!targetMuscle) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.VALIDATION.INVALID_ID);
        }
        const updateData = {
            title: data.title,
            description: data.description,
            bodyRegion: data.bodyRegion,
        };
        if (data.image) {
            const imageUrl = await this._s3Service.uploadFile(data.image, `target-muscles/${targetMuscle.key}`);
            updateData.image = imageUrl;
        }
        await this._targetMuscleRepository.updateTargetMuscle(targetMuscleId, updateData);
    }
    async toggleTargetMuscleStatus(targetMuscleId) {
        const targetMuscle = await this._targetMuscleRepository.toggleTargetMuscleStatus(targetMuscleId);
        if (!targetMuscle) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.VALIDATION.INVALID_ID);
        }
        return {
            message: targetMuscle.isActive
                ? messages_1.MESSAGES.TARGET_MUSCLE.UNBLOCKED
                : messages_1.MESSAGES.TARGET_MUSCLE.BLOCKED,
            targetMuscleId: targetMuscle._id || "",
            isActive: targetMuscle.isActive ?? true,
        };
    }
    // Equipment Methods
    async createEquipment(data) {
        const isExist = await this._equipmentRepository.findEquipmentByTitle(data.title);
        if (isExist) {
            throw new appError_1.AppError(statuscode_1.STATUS.CONFLICT, messages_1.MESSAGES.EQUIPMENT.EXISTS);
        }
        if (!data.image) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD);
        }
        const key = `equipment-${Date.now()}`;
        const imageUrl = await this._s3Service.uploadFile(data.image, `equipment/${key}`);
        const equipmentData = {
            key: key,
            title: data.title,
            image: imageUrl,
            description: data.description,
        };
        await this._equipmentRepository.createEquipment(equipmentData);
    }
    async getAllEquipment(query) {
        const { data, pagination } = await this._equipmentRepository.getAllEquipment(query);
        return {
            data: equipment_mapper_1.EquipmentMapper.toEquipmentDtoList(data),
            pagination,
        };
    }
    async getEquipmentById(equipmentId) {
        const equipment = await this._equipmentRepository.getEquipmentById(equipmentId);
        if (!equipment) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.VALIDATION.INVALID_ID);
        }
        return equipment_mapper_1.EquipmentMapper.toEquipmentDto(equipment);
    }
    async updateEquipment(equipmentId, data) {
        const equipment = await this._equipmentRepository.getEquipmentById(equipmentId);
        if (!equipment) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.VALIDATION.INVALID_ID);
        }
        const updateData = {
            title: data.title,
            description: data.description,
        };
        if (data.image) {
            const imageUrl = await this._s3Service.uploadFile(data.image, `equipment/${equipment.key}`);
            updateData.image = imageUrl;
        }
        await this._equipmentRepository.updateEquipment(equipmentId, updateData);
    }
    async toggleEquipmentStatus(equipmentId) {
        const equipment = await this._equipmentRepository.toggleEquipmentStatus(equipmentId);
        if (!equipment) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.VALIDATION.INVALID_ID);
        }
        return {
            message: equipment.isActive
                ? messages_1.MESSAGES.EQUIPMENT.UNBLOCKED
                : messages_1.MESSAGES.EQUIPMENT.BLOCKED,
            equipmentId: equipment._id || "",
            isActive: equipment.isActive ?? true,
        };
    }
    // Exercise Methods
    async createExercise(data) {
        const isExist = await this._exerciseRepository.findExerciseByTitle(data.title);
        if (isExist) {
            throw new appError_1.AppError(statuscode_1.STATUS.CONFLICT, messages_1.MESSAGES.EXERCISE.EXISTS);
        }
        if (!data.image) {
            throw new appError_1.AppError(statuscode_1.STATUS.BAD_REQUEST, messages_1.MESSAGES.EXERCISE.IMAGE_REQUIRED);
        }
        const key = (0, string_formatters_1.generateKeySlug)(data.title);
        const imageUrl = await this._s3Service.uploadFile(data.image, `exercises/${key}`);
        let videoUrl;
        if (data.video) {
            videoUrl = await this._s3Service.uploadFile(data.video, `exercises/${key}_video`);
        }
        const exerciseData = {
            key,
            title: data.title,
            description: data.description,
            instructions: data.instructions,
            media: {
                image: imageUrl,
                videoUrl,
            },
            categoryIds: data.categoryIds,
            targetMuscleIds: data.targetMuscleIds,
            equipmentIds: data.equipmentIds ?? [],
            workoutEnvironments: data.workoutEnvironments ?? [],
            difficulty: data.difficulty,
            isCompound: data.isCompound ?? false,
        };
        await this._exerciseRepository.createExercise(exerciseData);
    }
    async getAllExercises(query) {
        const { data, pagination } = await this._exerciseRepository.getAllExercises(query);
        return {
            data: exercise_mapper_1.ExerciseMapper.toExerciseDtoList(data),
            pagination,
        };
    }
    async getExerciseById(exerciseId) {
        const exercise = await this._exerciseRepository.getExerciseById(exerciseId);
        if (!exercise) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.EXERCISE.NOT_FOUND);
        }
        return exercise_mapper_1.ExerciseMapper.toExerciseDto(exercise);
    }
    async updateExercise(exerciseId, data) {
        const exercise = await this._exerciseRepository.getExerciseById(exerciseId);
        if (!exercise) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.EXERCISE.NOT_FOUND);
        }
        const updateData = {
            title: data.title,
            description: data.description,
            instructions: data.instructions,
            categoryIds: data.categoryIds,
            targetMuscleIds: data.targetMuscleIds,
            equipmentIds: data.equipmentIds,
            workoutEnvironments: data.workoutEnvironments,
            difficulty: data.difficulty,
            isCompound: data.isCompound,
        };
        if (data.video) {
            const videoUrl = await this._s3Service.uploadFile(data.video, `exercises/${exercise.key}_video`);
            updateData.media = { ...exercise.media, videoUrl };
        }
        if (data.image) {
            const imageUrl = await this._s3Service.uploadFile(data.image, `exercises/${exercise.key}`);
            updateData.media = {
                ...(updateData.media ?? exercise.media),
                image: imageUrl,
            };
        }
        await this._exerciseRepository.updateExercise(exerciseId, updateData);
    }
    async toggleExerciseStatus(exerciseId) {
        const exercise = await this._exerciseRepository.toggleExerciseStatus(exerciseId);
        if (!exercise) {
            throw new appError_1.AppError(statuscode_1.STATUS.NOT_FOUND, messages_1.MESSAGES.EXERCISE.NOT_FOUND);
        }
        return {
            message: exercise.isActive
                ? messages_1.MESSAGES.EXERCISE.UNBLOCKED
                : messages_1.MESSAGES.EXERCISE.BLOCKED,
            exerciseId: exercise._id || "",
            isActive: exercise.isActive ?? true,
        };
    }
}
exports.AdminService = AdminService;
