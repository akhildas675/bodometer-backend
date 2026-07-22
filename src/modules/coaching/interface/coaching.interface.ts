import { BookingMode, CoachingDuration } from "@/constants/constant.values.ts/booking.constant";
import { PaginationMeta } from "@/modules/booking/interface/booking.interface";

export interface Coaching{
    serviceId:string,
    serviceType:string,
    description:string,
    durationMinutes:CoachingDuration;
    price:number,
    bookingMode:BookingMode,
    isActive:boolean,
}

export interface CoachingQuery{
    search?:string,
    page?:number,
    limit?:number,
    sortBy?:string,
    sortOrder?:'asc'|'desc',
    serviceType?:string,
    isActive?:boolean
}

export interface GetAllCoachingResponse{
    data:Coaching[],
    pagination:PaginationMeta
}

export interface UpdateCoaching{
    serviceType?:string,
    description?:string,
    durationMinutes?:CoachingDuration;
    price?:number,
    bookingMode?:BookingMode,
    isActive?:boolean,
}