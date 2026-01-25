import { Role } from "../../constants/identity.constants";
import { AddWorkoutResponseDto, AdminGetUsersResponseDto, GetWorkoutsResponseDto } from "../../dto/admin/admin.dto";
import { AdminAccountInterface, Workout } from "../../interfaces/admin/admin.interface";
import { IWorkoutDocument } from "../../models/workout.model";

export class AdminAccountMapper {
  static toResponse<T extends Exclude<Role,"admin">>(
    account: AdminAccountInterface<T>
  ): AdminGetUsersResponseDto {
    return {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      isBlocked: account.isBlocked,
      isVerified: account.isVerified,
      createdAt: account.createdAt,
    };
  }

  static toResponseList<T extends Exclude<Role,"admin">>(
    accounts: AdminAccountInterface<T>[]
  ): AdminGetUsersResponseDto[] {
    return accounts.map((account) =>
      AdminAccountMapper.toResponse(account)
    );
  }
}

export class WorkoutMapper {
  static toResponse(workout: Workout): GetWorkoutsResponseDto {
    return {
      id: workout.id!,
      workoutName: workout.workoutName,
      workoutDescription: workout.workoutDescription,
      workoutImage: workout.workoutImage,
      isActive: workout.isActive,
    };
  }

  static toResponseList(workouts: Workout[]): GetWorkoutsResponseDto[] {
    return workouts.map(this.toResponse);
  }
}


