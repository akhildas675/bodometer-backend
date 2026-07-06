import { SlotDuration } from "@/constants/booking.constant"

export interface CreateAvailabilityDto{
    availability:{
        date:Date,
        shifts:{
            startTime:Date,
            endTime:Date,
            duration:SlotDuration
        }[]
    }[]
}