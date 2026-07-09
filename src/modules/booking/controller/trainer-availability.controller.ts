import { inject, injectable } from "inversify";
import { ITrainerAvailabilityService } from "../interface/trainer-availability-service.interface";
import { BOOKING_TYPES } from "../booking.types";
import { AuthRequest } from "@/middleware/authGuard";
import { Response,NextFunction } from "express";
import { MESSAGES } from "@/constants/messages";
import { CreateAvailabilityDto } from "../dto/booking.dto";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";


@injectable()
export class TrainerAvailabilityController{
    constructor(
        @inject(BOOKING_TYPES.TrainerAvailabilityService)
        private _trainerAvailabilityService:ITrainerAvailabilityService
    ) {}

    createAvailability = async(req:AuthRequest,res: Response,next:NextFunction)=>{
        try {

            console.log("slot details",req.body)
            
            const trainerId = req.user?.id;
            if (!trainerId) throw new Error('Unauthorized');
            const data = req.body as CreateAvailabilityDto;
            await this._trainerAvailabilityService.createAvailability(trainerId, data)

            new SuccessResponse(
                STATUS.CREATED,MESSAGES.BOOKING.BOOKING_CREATED,
            ).send(res)
            
        } catch (error:unknown) {
            if(error instanceof Error){
                next(error)
            }else{
                next(new Error(MESSAGES.BOOKING.BOOKING_CREATED_FAILED))
            }
        }
    }

    
}