import { BodyRegion } from "@/constants/fitness.constant";
import { PaginatedResponseDto, PaginationMetaDto, PaginationQueryDto } from "@/dto/common.dto";

export interface CreateTargetMuscleDto {
    title: string;
    description: string;
    image?: Express.Multer.File
    bodyRegion: BodyRegion
}

export interface TargetMuscleDto {
    targetMuscleId: string;
    title: string;
    description: string;
    image: string;
    bodyRegion: BodyRegion;
    isActive: boolean;
}

export interface GetAllTargetMusclesResponseDto {
    data: TargetMuscleDto[];
    pagination: PaginationMetaDto;
}

export interface GetTargetMuscleByIdResponseDto {
    targetMuscleId: string;
    title: string;
    description: string;
    image: string;
    bodyRegion: BodyRegion;
    isActive: boolean;
}

export interface UpdateTargetMuscleDto {
    targetMuscleId: string;
    title?: string;
    description?: string;
    image?: Express.Multer.File
    bodyRegion?: BodyRegion
}

export interface ToggleTargetMuscleStatusResponseDto {
    message: string;
    targetMuscleId: string;
    isActive: boolean;
}

export interface TargetMuscleQueryDto extends PaginationQueryDto {
    search?: string;
    bodyRegion?: BodyRegion;
    status?: string;
}
