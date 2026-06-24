import { inject, injectable } from "inversify";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/statuscode";
import { MESSAGES } from "@/constants/messages";
import { IEquipmentService } from "../interface/equipment-service.interface";
import { IEquipmentRepository } from "../interface/equipment-repository.interface";
import { EQUIPMENT_TYPES } from "../equipment.types";
import { EquipmentMapper } from "../mapper/equipment.mapper";
import { Equipment } from "@/interfaces/domain.interface/equipment";
import { IS3Service } from "@/interfaces/service-interface/s3/s3-service.interface";
import {
    CreateEquipmentDto,
    EquipmentDto,
    EquipmentQueryDto,
    GetAllEquipmentResponseDto,
    ToggleEquipmentStatusResponseDto,
    UpdateEquipmentDto,
} from "../dto/equipment.dto";

@injectable()
export class EquipmentService implements IEquipmentService {
    constructor(
        @inject(EQUIPMENT_TYPES.Repository)
        private _equipmentRepository: IEquipmentRepository,
        @inject(Symbol.for("S3Service")) private _s3Service: IS3Service,
    ) {}

    async createEquipment(data: CreateEquipmentDto): Promise<void> {
        const isExist = await this._equipmentRepository.findEquipmentByTitle(data.title);
        if (isExist) {
            throw new AppError(STATUS.CONFLICT, MESSAGES.EQUIPMENT.EXISTS);
        }

        if (!data.image) {
            throw new AppError(STATUS.BAD_REQUEST, "Image is required");
        }

        const key = `equipment-${Date.now()}`;
        const imageUrl = await this._s3Service.uploadFile(
            data.image,
            `equipment/${key}`
        );

        const equipmentData: Equipment = {
            key,
            title: data.title,
            image: imageUrl,
            description: data.description,
        };
        await this._equipmentRepository.createEquipment(equipmentData);
    }

    async getAllEquipment(query: EquipmentQueryDto): Promise<GetAllEquipmentResponseDto> {
        const { data, pagination } = await this._equipmentRepository.getAllEquipment(query);
        return {
            data: EquipmentMapper.toEquipmentDtoList(data),
            pagination,
        };
    }

    async getEquipmentById(equipmentId: string): Promise<EquipmentDto> {
        const equipment = await this._equipmentRepository.getEquipmentById(equipmentId);
        if (!equipment) {
            throw new AppError(STATUS.NOT_FOUND, MESSAGES.EQUIPMENT.EXISTS);
        }
        return EquipmentMapper.toEquipmentDto(equipment);
    }

    async updateEquipment(equipmentId: string, data: UpdateEquipmentDto): Promise<void> {
        const equipment = await this._equipmentRepository.getEquipmentById(equipmentId);
        if (!equipment) {
            throw new AppError(STATUS.NOT_FOUND, MESSAGES.EQUIPMENT.EXISTS);
        }

        const updateData: Partial<Equipment> = {
            title: data.title,
            description: data.description,
        };

        if (data.image) {
            const imageUrl = await this._s3Service.uploadFile(
                data.image,
                `equipment/${equipment.key}`
            );
            updateData.image = imageUrl;
        }

        await this._equipmentRepository.updateEquipment(equipmentId, updateData);
    }

    async toggleEquipmentStatus(equipmentId: string): Promise<ToggleEquipmentStatusResponseDto> {
        const equipment = await this._equipmentRepository.toggleEquipmentStatus(equipmentId);
        if (!equipment) {
            throw new AppError(STATUS.NOT_FOUND, MESSAGES.EQUIPMENT.EXISTS);
        }
        return {
            message: equipment.isActive
                ? MESSAGES.EQUIPMENT.UNBLOCKED
                : MESSAGES.EQUIPMENT.BLOCKED,
            equipmentId: equipment._id || "",
            isActive: equipment.isActive ?? true,
        };
    }
}
