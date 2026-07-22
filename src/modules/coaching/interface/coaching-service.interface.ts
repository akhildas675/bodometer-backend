import { Role } from "@/constants/constant.values.ts/roles";
import { CoachingDetailDto, CoachingQueryDto, CreateCoachingDto, GetAllCoachingResponseDto, UpdateCoachingDto } from "../dto/coaching.dto";

export interface ICoachingService{
    createCoaching(data: CreateCoachingDto):Promise<void>;
    getCoaching(query: CoachingQueryDto, role:Role):Promise<GetAllCoachingResponseDto>;
    getCoachingServiceById(serviceId: string):Promise<CoachingDetailDto | null>;
    updateCoachingService(serviceId: string, data: UpdateCoachingDto):Promise<void>;

    toggleCoachingStatus(serviceId: string): Promise<void>;
}