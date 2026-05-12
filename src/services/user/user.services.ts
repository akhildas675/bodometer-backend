import { MESSAGES } from "../../constants/messages";
import { STATUS } from "../../constants/statuscode";
import { ITrainerProfileRepository } from "../../interfaces/repository-interface/trainer/trainer.profile-repository.interface";
import { IUserRepository } from "../../interfaces/repository-interface/user/user-repository.interface";
import { IPaymentService,} from "../../interfaces/service-interface/payment/stripe-service.interface";
import { IS3Service } from "../../interfaces/service-interface/s3/s3-service.interface";
import { IUserService } from "../../interfaces/service-interface/user/user-service.interface";
import { UserMapper, UserMappers } from "../../mappers/user/user.mappers";
import { AppError } from "../../utils/appError";
import bcrypt from "bcrypt"
import { hashPassword } from "../../utils/password";
import { PaginationMeta } from "../../interfaces/domain.interface/admin.interface/admin.interface";
import { ActiveSubscriptionDto, CategoryDetailDto, ChangePasswordDto, FindUserResponseDto, GetTrainersQueryDto, TrainerDetailDto, TrainerListResponseDto, UpdateUserProfileDto, UserSubscriptionPlanResponseDto } from "../../dto/user/user.dto";
import { ICategoryRepository } from "../../interfaces/repository-interface/category/category-repository.interface";
import { CategoryQuery, GetAllCategoriesResponse } from "../../interfaces/domain.interface/admin.interface/admin.interface";
import { CategoryMappers } from "@/mappers/category/category.mapper";
import { ISubscriptionPlanRepository } from "@/interfaces/repository-interface/subscription/subscription-plan.repository";
import { UserSubscriptions } from "@/interfaces/domain.interface/user.interface/user.interface";
import Stripe from "stripe";
import { ISubscriptionTransactionRepository } from "@/interfaces/repository-interface/subscription/subscription.transaction-repository.interface";
import { IUserSubscriptionRepository } from "@/interfaces/repository-interface/subscription/user.subscription.repository.interface";

export class UserService implements IUserService {
  constructor(
    private _userRepo: IUserRepository,
    private _s3Service: IS3Service,
    private _trainerProfileRepo: ITrainerProfileRepository,
    private _paymentService:IPaymentService,
    private _categoryRepo: ICategoryRepository,
    private _subscriptionPlanRepository: ISubscriptionPlanRepository,
    private _subscriptionTransactionRepository:ISubscriptionTransactionRepository,
    private _userSubscriptionRepository:IUserSubscriptionRepository
  ) { }

  async fetchUser(userId: string): Promise<FindUserResponseDto> {
    const user = await this._userRepo.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    return UserMapper.toFindUserResponse(user);
  }

  async updateProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<FindUserResponseDto> {
    if (Object.keys(updateData).length === 0) {
      throw new AppError(STATUS.BAD_REQUEST, "No fields to update");
    }
    if (updateData.gender && updateData.gender === "prefer_not_say") {
      throw new AppError(STATUS.BAD_REQUEST, "Please select a valid gender");
    }
    if (!updateData.dateOfBirth) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.COMMON.SELECT_CORRECT_DOB,
      );
    }
    const dob = new Date(updateData.dateOfBirth);
    const today = new Date();
    const limitDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate(),
    );
    if (dob > limitDate) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.USER.AGE_RESTRICTION);
    }
    const updatedUser = await this._userRepo.updateProfile(userId, updateData);
    if (!updatedUser)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    return UserMapper.toFindUserResponse(updatedUser);
  }

  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const user = await this._userRepo.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);
    if (user.profilePic) {
      try {
        await this._s3Service.deleteFile(user.profilePic);
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
      }
    }
    const profilePicUrl = await this._s3Service.uploadFile(
      file,
      `profile-pictures/${userId}`,
    );
    await this._userRepo.updateProfile(userId, { profilePic: profilePicUrl });
    return profilePicUrl;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.USER.USER_NOT_FOUND);

    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match)
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.PASSWORD.INCORRECT_CURRENT_PASSWORD,
      );

    const sameAsOld = await bcrypt.compare(dto.newPassword, user.password);
    if (sameAsOld)
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.PASSWORD.NEW_PASSWORD_SAME_AS_OLD,
      );

    const hashedPassword = await hashPassword(dto.newPassword);
    await this._userRepo.updatePassword(userId, hashedPassword);
  }


  async getTrainers(
    query: GetTrainersQueryDto,
  ): Promise<TrainerListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 9;

    const { data, total } = await this._trainerProfileRepo.getApprovedTrainersPaginated(
      page,
      limit,
      query.search,
      query.sortBy,
      query.sortOrder,
      query.specializationId,
    );

    return {
      data: UserMappers.toListItemDtoArray(data),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getTrainerById(trainerId: string): Promise<TrainerDetailDto> {
    const data = await this._trainerProfileRepo.getTrainerByIdWithUser(trainerId);
    if (!data) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.TRAINER.NOT_FOUND);
    }
    return UserMappers.toTrainerDetailDto(data);
  }

  async getCategories(query: CategoryQuery): Promise<GetAllCategoriesResponse> {
    return this._categoryRepo.getAllCategories({ ...query, isActive: true } as CategoryQuery);
  }

  async getCategoryById(id: string): Promise<CategoryDetailDto> {
    const category = await this._categoryRepo.getCategoryById(id);
    if (!category)
      throw new AppError(STATUS.NOT_FOUND, "Category not found");
    return CategoryMappers.toCategoryDetailDto(category);
  }

  async getMySubscriptions(): Promise<UserSubscriptionPlanResponseDto[] | null> {
    return this._subscriptionPlanRepository.getActiveSubscriptionPlans();
  }

async createCheckoutSession(userId: string, planId: string): Promise<{ checkoutUrl: string }> {
  const activeSub = await this._userSubscriptionRepository.findActiveByUserId(userId);
  if (activeSub) {
    throw new AppError(STATUS.BAD_REQUEST, "User already has an active subscription. Cannot purchase another at this time.");
  }

  const plan = await this._subscriptionPlanRepository.getSubscriptionPlanById(planId);
  if (!plan) {
    throw new AppError(STATUS.NOT_FOUND, "Plan not found");
  }
 
  const result = await this._paymentService.createCheckoutSession({
    planName: plan.name,
    description: plan.description ?? "Bodometer Premium Access",
    amount: Math.round(plan.price * 100),
    currency: "inr",
    successUrl: `${process.env.CLIENT_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.CLIENT_URL}/subscription-cancel`,
    metadata: {
      userId,    // ← needed so verifyPaymentAndSave can trust the userId
      planId,
    },
  });
 
  return { checkoutUrl: result.url };
}
 
// ─── 3. ADD verifyPaymentAndSave ──────────────────────────────────────────────
 
async verifyPaymentAndSave(userId: string, sessionId: string): Promise<ActiveSubscriptionDto> {
  // 1. Fetch the Stripe session directly (no webhook needed)
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
 
  // 2. Verify it's actually paid
  if (session.payment_status !== "paid") {
    throw new AppError(STATUS.BAD_REQUEST, "Payment not completed");
  }
 
  // 3. Verify the session belongs to this user (metadata set during checkout)
  const sessionUserId = session.metadata?.userId;
  if (sessionUserId !== userId) {
    throw new AppError(STATUS.FORBIDDEN, "Session does not belong to this user");
  }
 
  const planId = session.metadata?.planId;
  if (!planId) {
    throw new AppError(STATUS.BAD_REQUEST, "Missing planId in session metadata");
  }
 
  // 4. Idempotency — if already processed, just return active subscription
  const existing = await this._subscriptionTransactionRepository.findByTransactionId(sessionId);
  if (existing) {
    const activeSub = await this.getActiveSubscription(userId);
    if (!activeSub) throw new AppError(STATUS.NOT_FOUND, "No active subscription found for existing session");
    return activeSub;
  }
 
  // 5. Fetch plan for duration
  const plan = await this._subscriptionPlanRepository.getSubscriptionPlanById(planId);
  if (!plan) {
    throw new AppError(STATUS.NOT_FOUND, "Plan not found");
  }
 
  // 6. Create UserSubscription
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (plan.durationInDays ?? 30));
 
  const userSubscription = await this._userSubscriptionRepository.create({
    userId,
    subscriptionPlanId: planId,
    startDate,
    endDate,
  });
 
  // 7. Create SubscriptionTransaction
  await this._subscriptionTransactionRepository.create({
    userId,
    subscriptionPlanId: planId,
    userSubscriptionId: String(userSubscription._id),
    amount: (session.amount_total ?? 0) / 100,
    currency: (session.currency ?? "inr").toUpperCase(),
    paymentMethod: "card",
    paymentGateway: "stripe",
    transactionId: sessionId,
    paymentStatus: "success",
    paidAt: new Date(),
    meta: {
      stripeSessionId: sessionId,
      customerEmail: session.customer_details?.email,
    },
  });
 
  // 8. Return the active subscription data
  return {
    subscriptionId: String(userSubscription._id),
    planId,
    planName: plan.name,
    startDate,
    endDate,
    status: "active",
    daysRemaining: plan.durationInDays ?? 30,
  };
}
 

async getActiveSubscription(userId: string): Promise<ActiveSubscriptionDto | null> {
  const sub = await this._userSubscriptionRepository.findActiveByUserId(userId);
  if (!sub) return null;

  const plan = sub.subscriptionPlanId as unknown as { _id: unknown; name: string };
  
  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return {
    subscriptionId: String(sub._id),
    planId: String(plan?._id ?? sub.subscriptionPlanId),
    planName: plan?.name ?? "Unknown",
    startDate: sub.startDate,
    endDate: sub.endDate,
    status: sub.status,
    daysRemaining,
  };
}

private async _buildActiveSubscriptionDto(userId: string): Promise<ActiveSubscriptionDto> {
  const sub = await this.getActiveSubscription(userId);
  if (!sub) throw new AppError(STATUS.NOT_FOUND, "No active subscription found");
  return sub;
}

}
