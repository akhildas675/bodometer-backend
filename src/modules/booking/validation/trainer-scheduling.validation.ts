import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { ICoachingRepository } from "@/modules/coaching/interface/coaching-repository.interface";
import { AppError } from "@/utils/appError";

export async function validateSelectedCoachingServices(
  serviceIds: string[],
  _coachingRepository: ICoachingRepository,
): Promise<void> {

  for (const serviceId of serviceIds) {

    const service  = await _coachingRepository.getCoachingServiceById(serviceId)
  

    if(!service){
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.COACHING.INVALID_SERVICE_IDS);
    }

    if(!service.isActive){
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.COACHING.COACHING_NOT_FOUND);
    }
   
  }
}