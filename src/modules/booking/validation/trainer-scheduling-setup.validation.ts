import { ROLES } from "@/constants/constant.values.ts/roles";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { ITrainerProfileRepository } from "@/modules/trainer/interface/trainer.profile-repository.interface";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";
import { AppError } from "@/utils/appError";
import { ITrainerAvailabilityRepository } from "../interface/repository.interface/trainer.availability-repository.interface";

export async function validateTrainerEligibility(
    trainerId: string,
    _userRepository: IUserRepository,
    _trainerProfileRepository: ITrainerProfileRepository,
):Promise<void>{
    const user = await _userRepository.findById(trainerId);
    if (!user) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.COMMON.NOT_FOUND);
    }

    if(user.role !== ROLES.TRAINER){
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.UNAUTHORIZED);
    }

    const trainerProfile = await _trainerProfileRepository.fetchTrainerStatus(trainerId);
    if (!trainerProfile) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.COMMON.NOT_FOUND);
    }
    
}


export async function validateInitialSetupDoesNotExist(
    trainerId: string,
    _availabilityRepository: ITrainerAvailabilityRepository,
):Promise<void>{
    const existingAvailability = await _availabilityRepository.getByTrainerId(trainerId);
    if (existingAvailability) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.AVAILABILITY.AVAILABILITY_ALREADY_EXISTS);
    }

}
