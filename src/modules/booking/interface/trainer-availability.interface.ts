import { SlotDuration } from "@/constants/constant.values.ts/booking.constant"


export interface TrainerAvailability{
    id:string,
    trainerId:string,
    availability:{
        date:Date,
        shifts:{
            startTime:Date,
            endTime:Date,
            duration:SlotDuration
        }[]
    }[]
    
}

export interface AvailabilityCreate{
    trainerId:string,
    availability:{
        date:Date,
        shifts:{
            startTime:Date,
            endTime:Date,
            duration:SlotDuration
        }[]
    }[]
}