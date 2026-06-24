import { PaginationMetaDto, PaginationQueryDto } from "@/dto/common.dto";

export interface CreateEquipmentDto {
    title: string;
    description: string;
    image?: Express.Multer.File;
}

export interface EquipmentDto {
    equipmentId: string;
    title: string;
    description: string;
    image: string;
    isActive: boolean;
}

export interface GetAllEquipmentResponseDto {
    data: EquipmentDto[];
    pagination: PaginationMetaDto;
}

export interface UpdateEquipmentDto {
    equipmentId: string;
    title?: string;
    description?: string;
    image?: Express.Multer.File;
}

export interface ToggleEquipmentStatusResponseDto {
    message: string;
    equipmentId: string;
    isActive: boolean;
}

export interface EquipmentQueryDto extends PaginationQueryDto {
    search?: string;
    status?: string;
}
