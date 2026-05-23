import { EquipmentDto } from "@/dto/equipment/equipment.dto";
import { Equipment } from "@/interfaces/domain.interface/equipment";

export class EquipmentMapper {
    static toEquipmentDto(equipment: Equipment): EquipmentDto {
        return {
            equipmentId: equipment._id || "",
            title: equipment.title,
            description: equipment.description,
            image: equipment.image,
            isActive: equipment.isActive ?? true,
        };
    }
    
    static toEquipmentDtoList(equipments: Equipment[]): EquipmentDto[] {
        return equipments.map(this.toEquipmentDto);
    }
}
