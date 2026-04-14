import { IBaseRepository } from "../base/base-repository.interface";
import { IUserDailyHabits } from "@/models/daily-habits.model";

export interface IDailyHabitsRepository extends IBaseRepository<Record<string, unknown>, IUserDailyHabits> {
}
