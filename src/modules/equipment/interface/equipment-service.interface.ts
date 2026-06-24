import {
    CreateEquipmentDto,
    EquipmentDto,
    EquipmentQueryDto,
    GetAllEquipmentResponseDto,
    ToggleEquipmentStatusResponseDto,
    UpdateEquipmentDto,
} from "../dto/equipment.dto";

export interface IEquipmentService {
    createEquipment(data: CreateEquipmentDto): Promise<void>;
    getAllEquipment(query: EquipmentQueryDto): Promise<GetAllEquipmentResponseDto>;
    getEquipmentById(equipmentId: string): Promise<EquipmentDto>;
    updateEquipment(equipmentId: string, data: UpdateEquipmentDto): Promise<void>;
    toggleEquipmentStatus(equipmentId: string): Promise<ToggleEquipmentStatusResponseDto>;
}
