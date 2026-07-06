import { Equipment } from "@/modules/equipment/interface/equipment.interface";
import { PaginatedResult } from "@/modules/base/interface/common.interface";
import { EquipmentQueryDto } from "@/modules/equipment/dto/equipment.dto";

export interface IEquipmentRepository {
    createEquipment(equipmentData: Equipment): Promise<Equipment>;
    getAllEquipment(query: EquipmentQueryDto): Promise<PaginatedResult<Equipment>>;
    getEquipmentById(equipmentId: string): Promise<Equipment | null>;
    updateEquipment(equipmentId: string, data: Partial<Equipment>): Promise<Equipment | null>;
    toggleEquipmentStatus(equipmentId: string): Promise<Equipment | null>;
    findEquipmentByTitle(title: string): Promise<Equipment | null>;
}
