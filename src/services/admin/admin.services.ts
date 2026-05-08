import { ICategoryRepository } from "@/interfaces/repository-interface/category/category-repository.interface";
import { MESSAGES } from "../../constants/messages";
import { ROLES } from "../../constants/roles";
import { STATUS } from "../../constants/statuscode";
import { VERIFICATION_STATUS } from "../../constants/verification.constants";
import { AdminGetTrainersDto, AdminGetTrainersResponseDto, AdminGetUsersDto, AdminGetUsersResponseDto, CategoryQueryDto, CreateCategoryDto, GetCategoriesResponseDto, GetTrainerAppointmentsQueryDto, PaginatedResponseDto, UpdateCategoryDto, GetCategoryByIdResponseDto, ToggleCategoryStatusResponseDto } from "../../dto/admin/admin.dto";
import { ApproveTrainerResponseDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, RejectTrainerResponseDto } from "../../dto/trainer/trainer.dto";
import { Category, PaginatedResult } from "../../interfaces/domain.interface/admin.interface/admin.interface";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IAdminService } from "../../interfaces/service-interface/admin/admin-service.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import { AdminAccountMapper, TrainerMapper } from "../../mappers/admin/admin.mappers";
import { AppError } from "../../utils/appError";




export class AdminService implements IAdminService {
  constructor(
    private _userRepository: IUserRepository,
    private _trainerProfileRepository: ITrainerProfileRepository,
    private _s3Service: IS3Service,
    private _categoryRepository: ICategoryRepository,

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
      image: imageUrl,
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
      image: category.image,
      isActive: category.isActive ?? true,
    };
  }

  async updateCategory(data: UpdateCategoryDto): Promise<void> {
    if (!data.categoryId) {
      throw new AppError(STATUS.BAD_REQUEST, 'Category ID is required');
    }
    if (!data.name) {
      throw new AppError(STATUS.BAD_REQUEST, 'Name is required');
    }
    if (!data.description) {
      throw new AppError(STATUS.BAD_REQUEST, 'Description is required');
    }

    const category = await this._categoryRepository.getCategoryById(data.categoryId);
    if (!category) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.CATEGORY_NOT_FOUND || 'Category not found');
    }

    // Upload new image only if provided; otherwise keep the existing one
    const imageUrl = data.image
      ? await this._s3Service.uploadFile(data.image, data.name)
      : category.image;

    const categoryData: Category = {
      name: data.name,
      description: data.description,
      image: imageUrl,
    };

    await this._categoryRepository.updateCategory(data.categoryId, categoryData);
  }

  async getAllCategories(query: CategoryQueryDto): Promise<GetCategoriesResponseDto> {
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
        image: cat.image,
        isActive: cat.isActive ?? true,
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
      message: updated.isActive ? 'Category unblocked successfully' : 'Category blocked successfully',
      category: {
        categoryId: updated.categoryId!,
        name: updated.name,
        description: updated.description,
        image: updated.image,
        isActive: updated.isActive ?? true,
      },
    };
  }

}