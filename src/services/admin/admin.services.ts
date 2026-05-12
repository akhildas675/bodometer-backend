import { ICategoryRepository } from "@/interfaces/repository-interface/category/category-repository.interface";
import { MESSAGES } from "../../constants/messages";
import { ROLES } from "../../constants/roles";
import { STATUS } from "../../constants/statuscode";
import { VERIFICATION_STATUS } from "../../constants/verification.constants";
import { AdminGetTrainersDto, AdminGetTrainersResponseDto, AdminGetUsersDto, AdminGetUsersResponseDto, CategoryQueryDto, CreateCategoryDto, GetTrainerAppointmentsQueryDto, PaginatedResponseDto, UpdateCategoryDto, GetCategoryByIdResponseDto, GetAllCategoriesResponseDto, ToggleCategoryStatusResponseDto, SubscriptionFeatureQueryDto, GetAllSubscriptionFeaturesResponseDto, CreateSubscriptionFeatureDto, UpdateSubscriptionFeatureDto, ToggleSubscriptionFeatureStatusResponseDto, SubscriptionFeatureDto, CreateSubscriptionPlanDto, SubscriptionPlanQueryDto, GetAllSubscriptionPlansResponseDto, GetSubscriptionPlanByIdResponseDto, UpdateSubscriptionPlanDto, ToggleSubscriptionPlanStatusResponseDto } from "../../dto/admin/admin.dto";
import { ApproveTrainerResponseDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, RejectTrainerResponseDto } from "../../dto/trainer/trainer.dto";
import { Category, PaginatedResult, SubscriptionFeature, SubscriptionPlan } from "../../interfaces/domain.interface/admin.interface/admin.interface";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IAdminService } from "../../interfaces/service-interface/admin/admin-service.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import { AdminAccountMapper, TrainerMapper } from "../../mappers/admin/admin.mappers";
import { AppError } from "../../utils/appError";
import { ISubscriptionFeatureRepository } from "@/interfaces/repository-interface/subscription/feature-repository.interface";
import { ISubscriptionPlanRepository } from "@/interfaces/repository-interface/subscription/subscription-plan.repository";




export class AdminService implements IAdminService {
  constructor(
    private _userRepository: IUserRepository,
    private _trainerProfileRepository: ITrainerProfileRepository,
    private _s3Service: IS3Service,
    private _categoryRepository: ICategoryRepository,
    private _subscriptionFeatureRepository: ISubscriptionFeatureRepository,
    private _subscriptionPlanRepository: ISubscriptionPlanRepository,

  ) { }

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
    if (!userId) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(userId, true);
  }

  async unblockUser(userId: string): Promise<void> {
    if (!userId) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
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
    if (!trainerId) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(trainerId, true);
  }

  async unblockTrainer(trainerId: string): Promise<void> {
    if (!trainerId) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    await this._userRepository.updateBlockStatus(trainerId, false);
  }

  async getTrainerAppointments(
    query: GetTrainerAppointmentsQueryDto,
  ): Promise<PaginatedResult<GetTrainerAppointmentsResponseDto>> {
    const { data, pagination } = await this._trainerProfileRepository.findAllWithUserPaginated(
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

  async getTrainerByProfileId(profileId: string): Promise<GetTrainerByIdResponseDto> {
    const trainer = await this._trainerProfileRepository.findByIdWithUser(profileId);
    if (!trainer) throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    return TrainerMapper.toDetailDto(trainer);
  }

  async approveTrainer(profileId: string): Promise<ApproveTrainerResponseDto> {
    const profile = await this._trainerProfileRepository.findById(profileId);
    if (!profile) throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND);

    if (profile.verificationStatus === VERIFICATION_STATUS.APPROVED) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.ADMIN.VERIFICATION_APPROVED_EXISTS);
    }

    const updated = await this._trainerProfileRepository.updateVerificationStatus(
      profileId,
      VERIFICATION_STATUS.APPROVED,
      null,
    );

    if (!updated) throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.VERIFICATION_APPROVED_FAILED);

    return TrainerMapper.toApproveDto(updated);
  }

  async rejectTrainer(profileId: string, reason: string): Promise<RejectTrainerResponseDto> {
    if (!reason?.trim()) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
    }

    const profile = await this._trainerProfileRepository.findById(profileId);
    if (!profile) throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.TRAINER_PROFILE_NOT_FOUND);

    const updated = await this._trainerProfileRepository.updateVerificationStatus(
      profileId,
      VERIFICATION_STATUS.REJECTED,
      reason,
    );

    if (!updated) throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.TRAINER_FAILED_TO_REJECTED);

    return TrainerMapper.toRejectDto(updated);
  }

  async createCategory(data: CreateCategoryDto): Promise<void> {


    if (!data.image) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.CATEGORY_CREATION_FAILED)
    }

    const imageUrl = await this._s3Service.uploadFile(data.image, data.name);
    const categoryData: Category = {
      name: data.name,
      description: data.description,
      media: { image: { url: imageUrl } },
      isActive: false
    };

    await this._categoryRepository.createCategory(categoryData);


  }

  async getCategoryById(categoryId: string): Promise<GetCategoryByIdResponseDto> {
    const category = await this._categoryRepository.getCategoryById(categoryId);
    if (!category) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.CATEGORY_NOT_FOUND)
    }
    return {
      categoryId: category.categoryId!,
      name: category.name,
      description: category.description,
      image: category.media.image.url,
    };
  }

  async updateCategory(data: UpdateCategoryDto): Promise<void> {
    if (!data.categoryId) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.ADMIN.CATEGORY_CREATION_FAILED || 'Category ID is required');
    }
    if (!data.name) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.ADMIN.CATEGORY_CREATION_FAILED || 'Name is required');
    }
    if (!data.description) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.ADMIN.CATEGORY_CREATION_FAILED || 'Description is required');
    }
    if (!data.image) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.ADMIN.CATEGORY_CREATION_FAILED || 'Image is required');
    }

    const category = await this._categoryRepository.getCategoryById(data.categoryId);
    if (!category) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.CATEGORY_NOT_FOUND || 'Category not found');
    }

    const imageUrl = await this._s3Service.uploadFile(data.image, data.name);
    const categoryData: Category = {
      name: data.name,
      description: data.description,
      media: { image: { url: imageUrl } },

    };

    await this._categoryRepository.updateCategory(data.categoryId, categoryData);
  }

  async getAllCategories(query: CategoryQueryDto): Promise<GetAllCategoriesResponseDto> {
    const { data, pagination } = await this._categoryRepository.getAllCategories({
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: data.map((cat) => ({
        categoryId: cat.categoryId!,
        name: cat.name,
        description: cat.description,
        image: cat.media.image.url,
        isActive: cat.isActive,
      })),
      pagination,
    };
  }

  async toggleCategoryStatus(categoryId: string): Promise<ToggleCategoryStatusResponseDto> {
    const category = await this._categoryRepository.getCategoryById(categoryId);
    if (!category) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.CATEGORY_NOT_FOUND || 'Category not found');
    }
    const updated = await this._categoryRepository.toggleCategoryStatus(categoryId);
    if (!updated) {
      throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.CATEGORY_CREATION_FAILED || 'Failed to toggle category status');
    }
    return {
      message: 'Category status toggled successfully',
      category: {
        categoryId: updated.categoryId!,
        name: updated.name,
        description: updated.description,
        image: updated.media.image.url,
      },
    };
  }

  async getAllSubscriptionFeatures(query: SubscriptionFeatureQueryDto): Promise<GetAllSubscriptionFeaturesResponseDto> {
    const { data, pagination } = await this._subscriptionFeatureRepository.getAllSubscriptionFeatures({
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: data.map((feature) => ({
        subscriptionFeatureId: feature.subscriptionFeatureId!,
        key: feature.key,
        title: feature.title,
        description: feature.description,
        type: feature.type,
        isActive: feature.isActive ?? false,
      })),
      pagination,
    };
  }

  async createSubscriptionFeature(data: CreateSubscriptionFeatureDto): Promise<void> {


    const generateFeatureKey = (title: string) => {
      return title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    };

    const featureData: SubscriptionFeature = {
      key: generateFeatureKey(data.title),
      title: data.title,
      description: data.description,
      type: data.type,
    };


    await this._subscriptionFeatureRepository.createSubscriptionFeature(featureData);
  }

  async updateSubscriptionFeature(data: UpdateSubscriptionFeatureDto): Promise<void> {

    if (!data.subscriptionFeatureId) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION?.ID_REQUIRED || 'Subscription Feature ID is required');
    }

    const updated = await this._subscriptionFeatureRepository.updateSubscriptionFeature(data.subscriptionFeatureId, {
      title: data.title,
      description: data.description,
      type: data.type,
    });

    if (!updated) {
      throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATION_FAILED || 'Failed to update subscription feature');
    }

  }

  async toggleSubscriptionFeatureStatus(subscriptionFeatureId: string): Promise<ToggleSubscriptionFeatureStatusResponseDto> {



    const updated = await this._subscriptionFeatureRepository.toggleSubscriptionFeatureStatus(subscriptionFeatureId);
    if (!updated) {
      throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATION_FAILED || 'Failed to toggle subscription feature status');
    }
    return {
      message: 'Subscription feature status toggled successfully',
      feature: {
        subscriptionFeatureId: updated.subscriptionFeatureId!,
        key: updated.key,
        title: updated.title,
        description: updated.description,
        type: updated.type,
        isActive: updated.isActive ?? false,
      },
    };
  }

  async getSubscriptionFeatureById(subscriptionFeatureId: string): Promise<SubscriptionFeatureDto> {
    const feature = await this._subscriptionFeatureRepository.getSubscriptionFeatureById(subscriptionFeatureId);
    if (!feature) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.SUBSCRIPTION_FEATURE_CREATION_FAILED || 'Subscription feature not found');
    }
    return {
      subscriptionFeatureId: feature.subscriptionFeatureId!,
      key: feature.key,
      title: feature.title,
      description: feature.description,
      type: feature.type,
      isActive: feature.isActive ?? false,
    };
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

    console.log("planData", planData)

    await this._subscriptionPlanRepository.createSubscriptionPlan(planData);

  }

  async getAllSubscriptionPlans(query: SubscriptionPlanQueryDto): Promise<GetAllSubscriptionPlansResponseDto> {
    const { data, pagination } = await this._subscriptionPlanRepository.getAllSubscriptionPlans({
      search: query.search,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      data: data.map((plan) => ({
        subscriptionPlanId: plan.subscriptionPlanId!,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        durationInDays: plan.durationInDays,
        isPopular: plan.isPopular,
        isActive: plan.isActive ?? true,
        features: plan.features,
      })),
      pagination,
    };
  }

  async getSubscriptionPlanById(subscriptionPlanId: string): Promise<GetSubscriptionPlanByIdResponseDto> {
    const plan = await this._subscriptionPlanRepository.getSubscriptionPlanById(subscriptionPlanId);
    if (!plan) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.SUBSCRIPTION_PLAN_FETCH_FAILED || 'Subscription plan not found');
    }
    return {
      subscriptionPlanId: plan.subscriptionPlanId!,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      durationInDays: plan.durationInDays,
      isPopular: plan.isPopular,
      isActive: plan.isActive ?? true,
      features: plan.features,
    };
  }

  async updateSubscriptionPlan(data: UpdateSubscriptionPlanDto): Promise<void> {
    if (!data.subscriptionPlanId) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION?.ID_REQUIRED || 'Subscription plan ID is required');
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
      throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.SUBSCRIPTION_PLAN_UPDATE_FAILED || 'Failed to update subscription plan');
    }
  }

  async toggleSubscriptionPlanStatus(subscriptionPlanId: string): Promise<ToggleSubscriptionPlanStatusResponseDto> {
    const updated = await this._subscriptionPlanRepository.toggleSubscriptionPlanStatus(subscriptionPlanId);
    if (!updated) {
      throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.ADMIN.SUBSCRIPTION_PLAN_TOGGLE_FAILED || 'Failed to toggle subscription plan status');
    }
    return {
      message: 'Subscription plan status toggled successfully',
      plan: {
        subscriptionPlanId: updated.subscriptionPlanId!,
        name: updated.name,
        description: updated.description,
        price: updated.price,
        durationInDays: updated.durationInDays,
        isPopular: updated.isPopular,
        isActive: updated.isActive ?? true,
        features: updated.features,
      },
    };
  }

}

//