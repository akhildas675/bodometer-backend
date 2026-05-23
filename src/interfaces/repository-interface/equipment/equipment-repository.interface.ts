import { Equipment } from "../../domain.interface/equipment";
import { PaginatedResult } from "../../domain.interface/common.interface";
import { EquipmentQueryDto } from "@/dto/equipment/equipment.dto";

export interface IEquipmentRepository {
    createEquipment(equipmentData: Equipment): Promise<Equipment>;
    getAllEquipment(query: EquipmentQueryDto): Promise<PaginatedResult<Equipment>>;
    getEquipmentById(equipmentId: string): Promise<Equipment | null>;
    updateEquipment(equipmentId: string, data: Partial<Equipment>): Promise<Equipment | null>;
    toggleEquipmentStatus(equipmentId: string): Promise<Equipment | null>;
    findEquipmentByTitle(title: string): Promise<Equipment | null>;
}
