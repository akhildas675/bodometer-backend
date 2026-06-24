import { Container } from "inversify";
import { EQUIPMENT_TYPES } from "./equipment.types";
import EquipmentRepository from "./repositories/equipment.repository";
import { EquipmentService } from "./service/equipment.service";
import { EquipmentController } from "./controller/equipment.controller";
import { IEquipmentRepository } from "./interface/equipment-repository.interface";
import { IEquipmentService } from "./interface/equipment-service.interface";

export const loadEquipmentBindings = (container: Container) => {
    container.bind<IEquipmentRepository>(EQUIPMENT_TYPES.Repository).to(EquipmentRepository);
    container.bind<IEquipmentService>(EQUIPMENT_TYPES.Service).to(EquipmentService);
    container.bind(EQUIPMENT_TYPES.Controller).to(EquipmentController);
};
