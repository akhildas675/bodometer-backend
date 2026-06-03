import { IUserWorkoutPlanModel } from "../../models/user.workout-plan.model";
import { WorkoutPlanResponseDto, WorkoutPlanDetailDto } from "../../dto/workout/workout-plan.dto";
import { WORKOUT_EXERCISE_STATUS } from "@/constants/fitness.constant";


export class WorkoutMapper {
  static toWorkoutPlanResponseDto(
    week: IUserWorkoutPlanModel,
    exerciseDataMap: Map<string, { title: string; image: string; muscles?: string[] }>
  ): WorkoutPlanResponseDto {
    return {
      workoutPlanId: week._id.toString(),
      days: week.workoutDays.map((wd) => ({
        dayNumber: wd.dayNumber,
        day: wd.dayName,
        scheduledDate: wd.scheduledDate,
        type: wd.type.toLowerCase() as "workout" | "rest",
        focus: wd.focus ?? "",
        estimatedDurationMinutes: wd.estimatedDurationMinutes ?? 0,
        status: wd.status,
        startedAt: wd.startedAt,
        completedAt: wd.completedAt,
        exercises: wd.exercises.map((ex) => {
          const exData = exerciseDataMap.get(ex.exerciseId.toString());
          return {
            instanceId: ex.instanceId,
            order: ex.order,
            exerciseId: ex.exerciseId.toString(),
            exerciseTitle: exData?.title ?? "Unknown Exercise",
            exerciseImage: exData?.image ?? "",
            targetMuscles: exData?.muscles || [],
            sets: ex.sets,
            reps: ex.reps ?? 0,
            durationSeconds: ex.durationSeconds,
            estimatedDurationSeconds: ex.estimatedDurationSeconds,
            restSeconds: ex.restSeconds,
            notes: ex.notes ?? "",
            status: ex.status ?? WORKOUT_EXERCISE_STATUS.PENDING,
            startedAt: ex.startedAt,
            timeTakenSeconds: ex.timeTakenSeconds,
          };
        }),
      })),
      planType: "custom" as const,
      weekNumber: week.weekNumber,
      startDate: week.startDate,
      formattedStartDate: new Date(week.startDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      endDate: week.endDate,
      formattedEndDate: week.endDate
        ? new Date(week.endDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        : undefined,
      status: week.status,
    };
  }

  static toWorkoutPlanDetailDto(
    week: IUserWorkoutPlanModel,
    exerciseDataMap: Map<string, { title: string; image: string; muscles?: string[] }>
  ): WorkoutPlanDetailDto {
    const responseDto = this.toWorkoutPlanResponseDto(week, exerciseDataMap);
    return {
      workoutPlanId: responseDto.workoutPlanId,
      days: responseDto.days,
      planType: responseDto.planType,
    };
  }
}
