import { inject, injectable } from "inversify";
import { IBookingService } from "../interface/booking-service.interface";
import { BOOKING_TYPES } from "../booking.types";
import { AuthRequest } from "@/middleware/authGuard";
import { Response,NextFunction } from "express";
import { MESSAGES } from "@/constants/messages";
import { CreateAvailabilityDto } from "../dto/booking.dto";

@injectable()
export class BookingController{
    constructor(
        @inject(BOOKING_TYPES.BookingService)
        private _bookingService:IBookingService
    ) {}

    createAvailability = async(req:AuthRequest,res: Response,next:NextFunction)=>{
        try {

            const trainerId = req.user?.id;
            if (!trainerId) throw new Error('Unauthorized');
            const data = req.body as CreateAvailabilityDto;
            await this._bookingService.createAvailability(trainerId, data)
            
        } catch (error:unknown) {
            if(error instanceof Error){
                next(error)
            }else{
                next(new Error(MESSAGES.BOOKING.BOOKING_CREATED))
            }
        }
    }

    
}