import { inject, injectable } from "inversify";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { IEquipmentService } from "../interface/equipment-service.interface";
import { IEquipmentRepository } from "../interface/equipment-repository.interface";
import { EQUIPMENT_TYPES } from "../equipment.types";
import { EquipmentMapper } from "../mapper/equipment.mapper";
import { Equipment } from '@/modules/equipment/interface/equipment.interface';
import { IS3Service } from '@/modules/s3/interface/s3-service.interface';
import { get, set, del, delPattern } from "@/config/redis";
import logger from "@/utils/logger";
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

        // Invalidate equipment caches
        try {
            await delPattern('equipment:all:*');
            logger.info('Equipment caches invalidated after create');
        } catch (error) {
            logger.error({ error }, 'Equipment cache invalidation error');
        }
    }

    async getAllEquipment(query: EquipmentQueryDto): Promise<GetAllEquipmentResponseDto> {
        // Check cache first
        const cacheKey = `equipment:all:${JSON.stringify(query)}`;
        try {
            const cached = await get(cacheKey);
            if (cached) {
                logger.info('Equipment list cache hit');
                return JSON.parse(cached) as GetAllEquipmentResponseDto;
            }
        } catch (error) {
            logger.error({ error }, 'Equipment cache read error');
        }

        const { data, pagination } = await this._equipmentRepository.getAllEquipment(query);
        const result: GetAllEquipmentResponseDto = {
            data: EquipmentMapper.toEquipmentDtoList(data),
            pagination,
        };

        // Cache for 1 hour
        try {
            await set(cacheKey, JSON.stringify(result), 3600);
            logger.info('Equipment list cached');
        } catch (error) {
            logger.error({ error }, 'Equipment cache write error');
        }

        return result;
    }

    async getEquipmentById(equipmentId: string): Promise<EquipmentDto> {
        // Check cache first
        const cacheKey = `equipment:byId:${equipmentId}`;
        try {
            const cached = await get(cacheKey);
            if (cached) {
                logger.info('Equipment by ID cache hit');
                return JSON.parse(cached) as EquipmentDto;
            }
        } catch (error) {
            logger.error({ error }, 'Equipment cache read error');
        }

        const equipment = await this._equipmentRepository.getEquipmentById(equipmentId);
        if (!equipment) {
            throw new AppError(STATUS.NOT_FOUND, MESSAGES.EQUIPMENT.EXISTS);
        }

        const result = EquipmentMapper.toEquipmentDto(equipment);

        // Cache for 1 hour
        try {
            await set(cacheKey, JSON.stringify(result), 3600);
            logger.info('Equipment by ID cached');
        } catch (error) {
            logger.error({ error }, 'Equipment cache write error');
        }

        return result;
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

        // Invalidate equipment caches
        try {
            await delPattern('equipment:all:*');
            await del(`equipment:byId:${equipmentId}`);
            logger.info('Equipment caches invalidated after update');
        } catch (error) {
            logger.error({ error }, 'Equipment cache invalidation error');
        }
    }

    async toggleEquipmentStatus(equipmentId: string): Promise<ToggleEquipmentStatusResponseDto> {
        const equipment = await this._equipmentRepository.toggleEquipmentStatus(equipmentId);
        if (!equipment) {
            throw new AppError(STATUS.NOT_FOUND, MESSAGES.EQUIPMENT.EXISTS);
        }

        // Invalidate equipment caches
        try {
            await delPattern('equipment:all:*');
            await del(`equipment:byId:${equipmentId}`);
            logger.info('Equipment caches invalidated after status toggle');
        } catch (error) {
            logger.error({ error }, 'Equipment cache invalidation error');
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
