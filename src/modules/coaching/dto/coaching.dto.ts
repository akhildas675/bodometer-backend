import { BookingMode, CoachingDuration } from "@/constants/constant.values.ts/booking.constant";
import { PaginationMetaDto } from "@/dto/common.dto";

export interface CreateCoachingDto{
    serviceId:string,
    serviceType:string,
    description:string,
    durationMinutes:CoachingDuration,
    price:number,
    bookingMode:BookingMode,
    isActive:boolean

}

export interface CoachingQueryDto{
    page?:number,
    limit?:number,
    sortBy?:string,
    sortOrder?:'asc'|'desc',
    serviceType?:string,
    isActive?:boolean
}

export interface CoachingDetailDto{
    serviceId:string,
    serviceType:string,
    description:string,
    durationMinutes:CoachingDuration,
    price:number,
    bookingMode:BookingMode,
    isActive:boolean
}

export interface GetAllCoachingResponseDto{
    data:CoachingDetailDto[],
    pagination:PaginationMetaDto

}


export interface UpdateCoachingDto{
    serviceType?:string,
    description?:string,
    durationMinutes?:CoachingDuration,
    price?:number,
    bookingMode?:BookingMode,
    isActive?:boolean
}