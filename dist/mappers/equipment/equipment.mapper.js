"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentMapper = void 0;
class EquipmentMapper {
    static toEquipmentDto(equipment) {
        return {
            equipmentId: equipment._id || "",
            title: equipment.title,
            description: equipment.description,
            image: equipment.image,
            isActive: equipment.isActive ?? true,
        };
    }
    static toEquipmentDtoList(equipments) {
        return equipments.map(this.toEquipmentDto);
    }
}
exports.EquipmentMapper = EquipmentMapper;
