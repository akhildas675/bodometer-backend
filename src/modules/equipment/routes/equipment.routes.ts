import container from "@/container/container";
import { Router } from "express";
import { EquipmentController } from "../controller/equipment.controller";
import { EQUIPMENT_TYPES } from "../equipment.types";
import { ROLE_GUARD } from "@/constants/role.guard";
import { mediaUpload } from "@/config/multer";
import { validate } from "@/middleware/validate";
import {
    createEquipmentSchema,
    updateEquipmentSchema,
} from "../validation/equipment.validator";
import { EQUIPMENT_PATHS } from "@/constants/routes.constant/equipment.paths";

const equipmentRoute = Router();

const equipmentController = container.get<EquipmentController>(EQUIPMENT_TYPES.Controller);

equipmentRoute.post(
    EQUIPMENT_PATHS.ROOT,
    ROLE_GUARD.ADMIN_GUARD,
    mediaUpload.single("image"),
    validate(createEquipmentSchema),
    equipmentController.createEquipment,
);

equipmentRoute.put(
    EQUIPMENT_PATHS.BY_ID,
    ROLE_GUARD.ADMIN_GUARD,
    mediaUpload.single("image"),
    validate(updateEquipmentSchema),
    equipmentController.updateEquipment,
);

equipmentRoute.get(
    EQUIPMENT_PATHS.BY_ID,
    ROLE_GUARD.ALL_GUARDS,
    equipmentController.getEquipmentById,
);

equipmentRoute.get(
    EQUIPMENT_PATHS.ROOT,
    ROLE_GUARD.ALL_GUARDS,
    equipmentController.getAllEquipment,
);

equipmentRoute.patch(
    EQUIPMENT_PATHS.STATUS,
    ROLE_GUARD.ADMIN_GUARD,
    equipmentController.toggleEquipmentStatus,
);

export default equipmentRoute;
