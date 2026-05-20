import { ICategoryRepository } from "@/interfaces/repository-interface/category/category-repository.interface";
import { MESSAGES } from "../../constants/messages";
import { ROLES } from "../../constants/roles";
import { STATUS } from "../../constants/statuscode";
import { VERIFICATION_STATUS } from "../../constants/verification.constants";
import {
  AdminGetUsersDto,
  AdminGetUsersResponseDto,
} from "../../dto/user/user.dto";
import {
  AdminGetTrainersDto,
  AdminGetTrainersResponseDto,
  GetTrainerAppointmentsQueryDto,
  GetTrainerAppointmentsResponseDto,
  GetTrainerByIdResponseDto,
  ApproveTrainerResponseDto,
  RejectTrainerResponseDto,
} from "../../dto/trainer/trainer.dto";
import {
  CategoryQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  GetCategoryByIdResponseDto,
  GetAllCategoriesResponseDto,
  ToggleCategoryStatusResponseDto,
} from "../../dto/category/category.dto";
import {
  SubscriptionFeatureQueryDto,
  GetAllSubscriptionFeaturesResponseDto,
  CreateSubscriptionFeatureDto,
  UpdateSubscriptionFeatureDto,
  ToggleSubscriptionFeatureStatusResponseDto,
  SubscriptionFeatureDto,
  CreateSubscriptionPlanDto,
  SubscriptionPlanQueryDto,
  GetAllSubscriptionPlansResponseDto,
  GetSubscriptionPlanByIdResponseDto,
  UpdateSubscriptionPlanDto,
  ToggleSubscriptionPlanStatusResponseDto,
  SubscriptionTransactionQueryDto,
  GetAllSubscriptionTransactionsResponseDto,
} from "../../dto/subscription/subscription.dto";
import {
  CreateQuestionGroupDto,
  UpdateQuestionGroupDto,
  GetAllQuestionGroupsResponseDto,
  QuestionQueryDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  GetAllQuestionsResponseDto,
  QuestionGroupResponseDto,
  OnboardingQuestionResponseDto,
} from "../../dto/onboarding/onboarding.dto";
import { PaginatedResponseDto } from "../../dto/common.dto";
import { Category } from "../../interfaces/domain.interface/category.interface";
import { PaginatedResult } from "../../interfaces/domain.interface/common.interface";
import {
  SubscriptionFeature,
  SubscriptionPlan,
} from "../../interfaces/domain.interface/subscription.interface";
import { QuestionGroupQuery } from "../../interfaces/domain.interface/onboarding.interface";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IAdminService } from "../../interfaces/service-interface/admin/admin-service.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import {
  AdminAccountMapper,
  TrainerMapper,
} from "../../mappers/admin/admin.mappers";
import { CategoryMappers } from "../../mappers/category/category.mapper";
import { SubscriptionMapper } from "@/mappers/subscription/subscription.mapper";
import { AppError } from "../../utils/appError";
import { ISubscriptionFeatureRepository } from "@/interfaces/repository-interface/subscription/feature-repository.interface";
import { ISubscriptionPlanRepository } from "@/interfaces/repository-interface/subscription/subscription-plan.repository";
import { IGroupRepository } from "@/interfaces/repository-interface/onboarding/group-repository.interface";
import { IQuestionRepository } from "@/interfaces/repository-interface/onboarding/question-repository.interface";
import {
  generateKeySlug,
  generateOptionValue,
} from "@/utils/string-formatters";

import { SubscriptionTransactionRepository } from "../../repositories/subscription-transaction.repository";
import { ISubscriptionTransactionRepository } from "../../interfaces/repository-interface/subscription/subscription.transaction-repository.interface";
import { DATA_SOURCES } from "../../constants/question.constant";

export class AdminService implements IAdminService {
  private _subscriptionTransactionRepository: ISubscriptionTransactionRepository = new SubscriptionTransactionRepository();

  constructor(
    private _userRepository: IUserRepository,
    private _trainerProfileRepository: ITrainerProfileRepository,
    private _s3Service: IS3Service,
    private _categoryRepository: ICategoryRepository,
    private _subscriptionFeatureRepository: ISubscriptionFeatureRepository,
    private _subscriptionPlanRepository: ISubscriptionPlanRepository,
    private _groupRepository: IGroupRepository,
    private _questionRepository: IQuestionRepository,
  ) {}

  //  Users
  async fetchUsers(
    query: AdminGetUsersDto,
  ): Promise<PaginatedResponseDto<AdminGetUsersResponseDto>> {
    const { data, pagination } = await this._userRepository.findByRolePaginated(
      ROLES.USER,
      query.search,
      query.sortBy,
      query.sortOrder,
      query.page,
      query.limit,
    );

    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(pagination.totalItems / limit);

    return {
      data: AdminAccountMapper.toResponseList(data),
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

  async blockUser(userId: string): Promise<void> {
    if (!userId)
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(userId, true);
  }

  async unblockUser(userId: string): Promise<void> {
    if (!userId)
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(userId, false);
  }

  //Trainers
  async fetchTrainers(
    query: AdminGetTrainersDto,
  ): Promise<PaginatedResponseDto<AdminGetTrainersResponseDto>> {
    const { data, pagination } = await this._userRepository.findByRolePaginated(
      ROLES.TRAINER,
      query.search,
      query.sortBy,
      query.sortOrder,
      query.page,
      query.limit,
    );

    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(pagination.totalItems / limit);

    return {
      data: AdminAccountMapper.toResponseList(data),
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

  async blockTrainer(trainerId: string): Promise<void> {
    if (!trainerId)
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(trainerId, true);
  }

  async unblockTrainer(trainerId: string): Promise<void> {
    if (!trainerId)
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(trainerId, false);
  }

  async getTrainerAppointments(
    query: GetTrainerAppointmentsQueryDto,
  ): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>> {
    const { data, pagination } =
      await this._trainerProfileRepository.findAllWithUserPaginated(
        query.search,
        query.sortBy,
        query.sortOrder,
        query.page,
        query.limit,
        query.status,
      );

    return {
      data: TrainerMapper.toDtoArray(data),
      pagination,
    };
  }

  async getTrainerByProfileId(
    profileId: string,
  ): Promise<GetTrainerByIdResponseDto> {
    const trainer =
      await this._trainerProfileRepository.findByIdWithUser(profileId);
    if (!trainer)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    return TrainerMapper.toDetailDto(trainer);
  }

  async approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto> {
    const profile = await this._trainerProfileRepository.findById(profileId);
    if (!profile)
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND,
      );

    if (profile.verificationStatus === VERIFICATION_STATUS.APPROVED) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.ADMIN.VERIFICATION_APPROVED_EXISTS,
      );
    }

    const updated =
      await this._trainerProfileRepository.updateVerificationStatus(
        profileId,
        VERIFICATION_STATUS.APPROVED,
        null,
      );

    if (!updated)
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.ADMIN.VERIFICATION_APPROVED_FAILED,
      );

    return TrainerMapper.toApproveDto(updated);
  }

  async rejectTrainer(
    profileId: string,
    reason: string,
  ): Promise<RejectTrainerResponseDto> {
    if (!reason?.trim()) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VALIDATION.REQUIRED_FIELD,
      );
    }

    const profile = await this._trainerProfileRepository.findById(profileId);
    if (!profile)
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND,
      );

    const updated =
      await this._trainerProfileRepository.updateVerificationStatus(
        profileId,
        VERIFICATION_STATUS.REJECTED,
        reason,
      );

    if (!updated)
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.ADMIN.TRAINER_FAILED_TO_REJECTED,
      );

    return TrainerMapper.toRejectDto(updated);
  }

  async createCategory(data: CreateCategoryDto): Promise<void> {
    if (!data.image) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ADMIN.CATEGORY_CREATION_FAILED,
      );
    }

    const imageUrl = await this._s3Service.uploadFile(data.image, data.name);
    const categoryData: Category = {
      name: data.name,
      description: data.description,
      media: { image: { url: imageUrl } },
      isActive: true,
    };

    await this._categoryRepository.createCategory(categoryData);
  }

  async getCategoryById(
    categoryId: string,
  ): Promise<GetCategoryByIdResponseDto> {
    const category = await this._categoryRepository.getCategoryById(categoryId);
    if (!category) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.CATEGORY_NOT_FOUND);
    }
    return CategoryMappers.toGetCategoryByIdResponseDto(category);
  }

  async updateCategory(data: UpdateCategoryDto): Promise<void> {
    if (!data.categoryId) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.ADMIN.CATEGORY_CREATION_FAILED || "Category ID is required",
      );
    }
    if (!data.name) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.ADMIN.CATEGORY_CREATION_FAILED || "Name is required",
      );
    }
    if (!data.description) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.ADMIN.CATEGORY_CREATION_FAILED || "Description is required",
      );
    }

    const category = await this._categoryRepository.getCategoryById(
      data.categoryId,
    );
    if (!category) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ADMIN.CATEGORY_NOT_FOUND || "Category not found",
      );
    }

    let imageUrl = category.media.image.url;
    if (data.image) {
      imageUrl = await this._s3Service.uploadFile(data.image, data.name);
    }

    const categoryData: Category = {
      name: data.name,
      description: data.description,
      media: { image: { url: imageUrl } },
    };

    await this._categoryRepository.updateCategory(
      data.categoryId,
      categoryData,
    );
  }

  async getAllCategories(
    query: CategoryQueryDto,
  ): Promise<GetAllCategoriesResponseDto> {
    const { data, pagination } =
      await this._categoryRepository.getAllCategories({
        search: query.search,
        page: query.page,
        limit: query.limit,
      });

    return {
      data: CategoryMappers.toCategoryResponseDtoList(data),
      pagination,
    };
  }

  async toggleCategoryStatus(
    categoryId: string,
  ): Promise<ToggleCategoryStatusResponseDto> {
    const category = await this._categoryRepository.getCategoryById(categoryId);
    if (!category) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ADMIN.CATEGORY_NOT_FOUND || "Category not found",
      );
    }
    const updated =
      await this._categoryRepository.toggleCategoryStatus(categoryId);
    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.ADMIN.CATEGORY_CREATION_FAILED ||
          "Failed to toggle category status",
      );
    }
    return {
      message: MESSAGES.ADMIN.CATEGORY_STATUS_TOGGLED,
      category: CategoryMappers.toCategoryResponseDto(updated),
    };
  }

  async getAllSubscriptionFeatures(
    query: SubscriptionFeatureQueryDto,
  ): Promise<GetAllSubscriptionFeaturesResponseDto> {
    const { data, pagination } =
      await this._subscriptionFeatureRepository.getAllSubscriptionFeatures({
        search: query.search,
        page: query.page,
        limit: query.limit,
      });

    return {
      data: SubscriptionMapper.toFeatureDtoList(data),
      pagination,
    };
  }

  async createSubscriptionFeature(
    data: CreateSubscriptionFeatureDto,
  ): Promise<void> {
    const generateFeatureKey = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
    };

    const featureData: SubscriptionFeature = {
      key: generateFeatureKey(data.title),
      title: data.title,
      description: data.description,
      type: data.type,
    };

    await this._subscriptionFeatureRepository.createSubscriptionFeature(
      featureData,
    );
  }

  async updateSubscriptionFeature(
    data: UpdateSubscriptionFeatureDto,
  ): Promise<void> {
    if (!data.subscriptionFeatureId) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VALIDATION?.ID_REQUIRED ||
          "Subscription Feature ID is required",
      );
    }

    const updated =
      await this._subscriptionFeatureRepository.updateSubscriptionFeature(
        data.subscriptionFeatureId,
        {
          title: data.title,
          description: data.description,
          type: data.type,
        },
      );

    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATION_FAILED ||
          "Failed to update subscription feature",
      );
    }
  }

  async toggleSubscriptionFeatureStatus(
    subscriptionFeatureId: string,
  ): Promise<ToggleSubscriptionFeatureStatusResponseDto> {
    const updated =
      await this._subscriptionFeatureRepository.toggleSubscriptionFeatureStatus(
        subscriptionFeatureId,
      );
    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATION_FAILED ||
          "Failed to toggle subscription feature status",
      );
    }
    return {
      message: MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_STATUS_TOGGLED,
      feature: SubscriptionMapper.toFeatureDto(updated),
    };
  }

  async getSubscriptionFeatureById(
    subscriptionFeatureId: string,
  ): Promise<SubscriptionFeatureDto> {
    const feature =
      await this._subscriptionFeatureRepository.getSubscriptionFeatureById(
        subscriptionFeatureId,
      );
    if (!feature) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATION_FAILED ||
          "Subscription feature not found",
      );
    }
    return SubscriptionMapper.toFeatureDto(feature);
  }

  async createSubscriptionPlan(data: CreateSubscriptionPlanDto): Promise<void> {
    const planData: SubscriptionPlan = {
      name: data.name,
      description: data.description,
      price: data.price,
      durationInDays: data.durationInDays,
      features: data.features,
      isPopular: data.isPopular ?? false,
    };

    await this._subscriptionPlanRepository.createSubscriptionPlan(planData);
  }

  async getAllSubscriptionPlans(
    query: SubscriptionPlanQueryDto,
  ): Promise<GetAllSubscriptionPlansResponseDto> {
    const { data, pagination } =
      await this._subscriptionPlanRepository.getAllSubscriptionPlans({
        search: query.search,
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

    return {
      data: SubscriptionMapper.toPlanDtoList(data),
      pagination,
    };
  }

  async getSubscriptionPlanById(
    subscriptionPlanId: string,
  ): Promise<GetSubscriptionPlanByIdResponseDto> {
    const plan =
      await this._subscriptionPlanRepository.getSubscriptionPlanById(
        subscriptionPlanId,
      );
    if (!plan) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ADMIN.SUBSCRIPTION_PLAN_FETCH_FAILED ||
          "Subscription plan not found",
      );
    }
    return SubscriptionMapper.toPlanByIdResponseDto(plan);
  }

  async updateSubscriptionPlan(data: UpdateSubscriptionPlanDto): Promise<void> {
    if (!data.subscriptionPlanId) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VALIDATION?.ID_REQUIRED || "Subscription plan ID is required",
      );
    }
    const updated =
      await this._subscriptionPlanRepository.updateSubscriptionPlan(
        data.subscriptionPlanId,
        {
          name: data.name,
          description: data.description,
          price: data.price,
          durationInDays: data.durationInDays,
          isPopular: data.isPopular,
          isActive: data.isActive,
          features: data.features,
        },
      );
    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.ADMIN.SUBSCRIPTION_PLAN_UPDATE_FAILED ||
          "Failed to update subscription plan",
      );
    }
  }

  async toggleSubscriptionPlanStatus(
    subscriptionPlanId: string,
  ): Promise<ToggleSubscriptionPlanStatusResponseDto> {
    const updated =
      await this._subscriptionPlanRepository.toggleSubscriptionPlanStatus(
        subscriptionPlanId,
      );
    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.ADMIN.SUBSCRIPTION_PLAN_TOGGLE_FAILED ||
          "Failed to toggle subscription plan status",
      );
    }
    return {
      message: MESSAGES.ADMIN.SUBSCRIPTION_PLAN_TOGGLED,
      plan: SubscriptionMapper.toPlanDto(updated),
    };
  }

  // Question Groups
  async createQuestionGroup(data: CreateQuestionGroupDto): Promise<void> {
    await this._groupRepository.createGroup({
      key: generateKeySlug(data.title),
      title: data.title,
      order: data.order,
    });
  }

  async getAllQuestionGroups(
    query: QuestionGroupQuery,
  ): Promise<GetAllQuestionGroupsResponseDto> {
    const result = await this._groupRepository.getAllGroups(query);
    return {
      data: result.data.map((g) => ({
        groupId: g.groupId!,
        key: g.key,
        title: g.title,
        order: g.order,
        isActive: g.isActive ?? true,
      })),
      pagination: result.pagination,
    };
  }

  async getQuestionGroupById(
    groupId: string,
  ): Promise<QuestionGroupResponseDto> {
    const group = await this._groupRepository.getGroupById(groupId);
    if (!group) throw new AppError(STATUS.NOT_FOUND, "Group not found");
    return {
      groupId: group.groupId!,
      key: group.key,
      title: group.title,
      order: group.order,
      isActive: group.isActive ?? true,
    };
  }

  async updateQuestionGroup(
    groupId: string,
    data: UpdateQuestionGroupDto,
  ): Promise<void> {
    await this._groupRepository.updateGroup(groupId, {
      title: data.title,
      order: data.order,
      key: "",
    });
  }

  async toggleQuestionGroupStatus(groupId: string): Promise<void> {
    await this._groupRepository.toggleGroupStatus(groupId);
  }

  // Questions
  async createQuestion(
    data: CreateQuestionDto,
    adminId: string,
  ): Promise<void> {
    const options = data.dataSource === "category"
      ? []
      : data.options?.map((o) => ({
          label: o.label.trim(),
          value: generateOptionValue(o.label),
        }));

    await this._questionRepository.createQuestion({
      ...data,
      key: generateKeySlug(data.question),
      createdBy: adminId,
      options,
    });
  }

  async getAllQuestions(
    query: QuestionQueryDto,
  ): Promise<GetAllQuestionsResponseDto> {
    const result = await this._questionRepository.getAllQuestions(query);
    return {
      data: result.data.map((q) => ({
        questionId: q.questionId!,
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

  async getQuestionById(
    questionId: string,
  ): Promise<OnboardingQuestionResponseDto> {
    const q = await this._questionRepository.getQuestionById(questionId);
    if (!q) throw new AppError(STATUS.NOT_FOUND, "Question not found");
    return {
      questionId: q.questionId!,
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

  async updateQuestion(
    questionId: string,
    data: UpdateQuestionDto,
  ): Promise<void> {
    const options = data.dataSource === "category"
      ? []
      : data.options?.map((o) => ({
          label: o.label.trim(),
          value: generateOptionValue(o.label),
        }));

    await this._questionRepository.updateQuestion(questionId, {
      ...data,
      options,
    });
  }

  async toggleQuestionStatus(questionId: string): Promise<void> {
    await this._questionRepository.toggleQuestionStatus(questionId);
  }

  async getAllSubscriptionTransactions(
    query: SubscriptionTransactionQueryDto,
  ): Promise<GetAllSubscriptionTransactionsResponseDto> {
    const { data, pagination } =
      await this._subscriptionTransactionRepository.findAllPaginated(
        query.search,
        query.sortBy,
        query.sortOrder,
        query.page,
        query.limit,
        query.status,
      );

    return {
      data: SubscriptionMapper.toTransactionDtoList(data),
      pagination,
    };
  }

  getQuestionDataSources(): Promise<{ label: string; value: string }[]> {
    const labels: Record<string, string> = {
      category: "Workout Categories",
    };
    return Promise.resolve(
      DATA_SOURCES.map((source) => ({
        value: source,
        label: labels[source] || source.charAt(0).toUpperCase() + source.slice(1),
      }))
    );
  }
}
