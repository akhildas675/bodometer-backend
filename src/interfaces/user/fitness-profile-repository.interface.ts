import { IBaseRepository } from "../base/base-repository.interface";
import { IUserFitnessProfile } from "@/models/fitness-profile.model";

export interface IFitnessProfileRepository extends IBaseRepository<Record<string, unknown>, IUserFitnessProfile> {
}
