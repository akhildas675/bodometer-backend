import { ActiveSubscriptionDto, ChangePasswordDto, CheckoutSessionResponseDto, CreateCheckoutSessionDto, FindUserResponseDto, GetTrainersQueryDto, GetUserWorkoutsQueryDto, TrainerDetailDto, TrainerListResponseDto, UpdateUserProfileDto, UserWorkoutResponseDto, WorkoutDetailPageDto } from "@/dto/user/user.dto";
import { PaginationMeta } from "../admin/admin.interface";
import { GetSubscriptionsResponseDto } from "@/dto/admin/admin.dto";


export interface IUserService {
  fetchUser(userId: string): Promise<FindUserResponseDto>;
  updateProfile(userId: string, updateData: UpdateUserProfileDto): Promise<FindUserResponseDto>;
  uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<string>;

  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
  getWorkouts(
    query: GetUserWorkoutsQueryDto,
  ): Promise<{ data: UserWorkoutResponseDto[]; pagination: PaginationMeta }>;

  getWorkoutDetail(workoutId: string): Promise<WorkoutDetailPageDto>;

  getActiveSubscriptions(): Promise<GetSubscriptionsResponseDto[]>;
  getUserActiveSubscription(userId: string): Promise<ActiveSubscriptionDto | null>;
  createCheckoutSession(userId: string, dto: CreateCheckoutSessionDto): Promise<CheckoutSessionResponseDto>;
  handleStripeWebhook(payload: Buffer, signature: string): Promise<void>;

  getTrainers(query: GetTrainersQueryDto): Promise<TrainerListResponseDto>;
  getTrainerById(id:string):Promise<TrainerDetailDto>

}