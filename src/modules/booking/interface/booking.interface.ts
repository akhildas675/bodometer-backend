import { SlotDuration } from "@/constants/booking.constant"


export interface TrainerAvailability{
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