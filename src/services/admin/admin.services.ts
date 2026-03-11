import {
  AddWorkoutDto,
  AddWorkoutResponseDto,
  CreateSubscriptionDTO,
  SubscriptionResponseDTO,
  UpdateSubscriptionDTO,

} from "@/dto/admin/admin.dto";
import { IAdminService } from "@/interfaces/admin/admin-service.interface";
import {

  WorkoutMapper,
} from "@/mappers/admin/admin.mappers";

import { Workout } from "@/interfaces/admin/admin.interface";

import { IAdminRepository } from "@/interfaces/admin/admin-repository.interface";
import { IS3Service } from "@/interfaces/s3/s3-service.interface";
import { SubscriptionMapper } from "@/mappers/admin/subscription.mapper";
import { ISubscriptionRepository } from "@/interfaces/admin/subscription/subscription-repository.interface";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/statuscode";
import { MESSAGES } from "@/constants/messages";


export class AdminService implements IAdminService {
  constructor(
    private _adminRepo: IAdminRepository,
    private _s3Service: IS3Service,
    private _subscriptionRepo: ISubscriptionRepository,
  ) { }

  //workouts

  async workoutAdd(body: AddWorkoutDto): Promise<AddWorkoutResponseDto> {
    const imageUrl = await this._s3Service.uploadFile(body.file, "workouts");

    const workout: Workout = {
      workoutName: body.workoutName,
      workoutDescription: body.workoutDescription,
      workoutImage: imageUrl,
      isActive: true,
    };

    const savedWorkout = await this._adminRepo.createWorkout(workout);

    return WorkoutMapper.toResponse(savedWorkout);
  }

  async fetchWorkouts(): Promise<Workout[]> {
    return this._adminRepo.getAllWorkouts();
  }



  async createSubscription(
    data: CreateSubscriptionDTO
  ): Promise<SubscriptionResponseDTO> {

    const subscriptionDomain = SubscriptionMapper.fromCreateDTO(data)

    const subscription =
      await this._subscriptionRepo.createSubscription(subscriptionDomain)

    return SubscriptionMapper.toResponse(subscription)
  }



async getAllSubscriptions(): Promise<SubscriptionResponseDTO[]> {
  const subscriptions = await this._subscriptionRepo.findAllSubscriptions();
  return subscriptions.map(SubscriptionMapper.toResponse);
}

async getSubscriptionById(id: string): Promise<SubscriptionResponseDTO> {
  const subscription = await this._subscriptionRepo.findSubscriptionById(id);
  if (!subscription) {
    throw new AppError(STATUS.NOT_FOUND, MESSAGES.SUBSCRIPTION.NOT_FOUND);
  }
  return SubscriptionMapper.toResponse(subscription);
}

async updateSubscription(
  id: string,
  data: UpdateSubscriptionDTO
): Promise<SubscriptionResponseDTO> {
  const exists = await this._subscriptionRepo.findSubscriptionById(id);
  if (!exists) {
    throw new AppError(STATUS.NOT_FOUND, MESSAGES.SUBSCRIPTION.NOT_FOUND);
  }
  const updateData = SubscriptionMapper.fromUpdateDTO(data);
  const updated = await this._subscriptionRepo.updateSubscription(id, updateData);
  if (!updated) {
    throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.SUBSCRIPTION.UPDATE_FAILED);
  }
  return SubscriptionMapper.toResponse(updated);
}
async toggleSubscriptionStatus(id: string): Promise<SubscriptionResponseDTO> {
  const exists = await this._subscriptionRepo.findSubscriptionById(id);
  if (!exists) {
    throw new AppError(STATUS.NOT_FOUND, MESSAGES.SUBSCRIPTION.NOT_FOUND);
  }
  const updated = await this._subscriptionRepo.setSubscriptionStatus(id, !exists.isActive); 
  if (!updated) {
    throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.SUBSCRIPTION.UPDATE_FAILED);
  }
  return SubscriptionMapper.toResponse(updated);
}
}
