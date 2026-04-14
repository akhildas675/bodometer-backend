import { IBaseRepository } from "../base/base-repository.interface";
import { IUserMedicalProfile } from "@/models/medical-profile.model";

export interface IMedicalProfileRepository extends IBaseRepository<Record<string, unknown>, IUserMedicalProfile> {
}
