import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { EQUIPMENT_TYPES } from "../equipment.types";
import { IEquipmentService } from "../interface/equipment-service.interface";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/statuscode";
import {
    CreateEquipmentDto,
    EquipmentQueryDto,
    UpdateEquipmentDto,
} from "../dto/equipment.dto";

@injectable()
export class EquipmentController {
    constructor(
        @inject(EQUIPMENT_TYPES.Service)
        private _equipmentService: IEquipmentService,
    ) {}

    createEquipment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = req.body as CreateEquipmentDto;
            dto.image = req.file;

            await this._equipmentService.createEquipment(dto);

            new SuccessResponse(STATUS.CREATED, "Equipment created successfully.").send(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                next(new Error("Unknown error occurred"));
            }
        }
    };

    getAllEquipment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query as unknown as EquipmentQueryDto;
            const { data, pagination } = await this._equipmentService.getAllEquipment(query);

            new SuccessResponse(STATUS.OK, "Equipment fetched successfully.", data, pagination).send(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                next(new Error("Unknown error occurred"));
            }
        }
    };

    getEquipmentById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const equipmentId = String(req.params.id);
            const data = await this._equipmentService.getEquipmentById(equipmentId);

            new SuccessResponse(STATUS.OK, "Equipment fetched successfully.", data).send(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                next(new Error("Unknown error occurred"));
            }
        }
    };

    toggleEquipmentStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const equipmentId = String(req.params.id);
            const data = await this._equipmentService.toggleEquipmentStatus(equipmentId);

            new SuccessResponse(STATUS.OK, data.message, data).send(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                next(new Error("Unknown error occurred"));
            }
        }
    };

    updateEquipment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const equipmentId = String(req.params.id);
            const dto = req.body as UpdateEquipmentDto;
            dto.equipmentId = equipmentId;
            dto.image = req.file;

            await this._equipmentService.updateEquipment(equipmentId, dto);

            new SuccessResponse(STATUS.OK, "Equipment updated successfully.").send(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
}
