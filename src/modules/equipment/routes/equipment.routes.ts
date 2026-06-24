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
} from "@/validators/admin/admin-validator";

const equipmentRoute = Router();

const equipmentController = container.get<EquipmentController>(EQUIPMENT_TYPES.Controller);

equipmentRoute.post(
    "/",
    ROLE_GUARD.ADMIN_GUARD,
    mediaUpload.single("image"),
    validate(createEquipmentSchema),
    equipmentController.createEquipment,
);

equipmentRoute.put(
    "/:id",
    ROLE_GUARD.ADMIN_GUARD,
    mediaUpload.single("image"),
    validate(updateEquipmentSchema),
    equipmentController.updateEquipment,
);

equipmentRoute.get(
    "/:id",
    ROLE_GUARD.ALL_GUARDS,
    equipmentController.getEquipmentById,
);

equipmentRoute.get(
    "/",
    ROLE_GUARD.ALL_GUARDS,
    equipmentController.getAllEquipment,
);

equipmentRoute.patch(
    "/:id/status",
    ROLE_GUARD.ADMIN_GUARD,
    equipmentController.toggleEquipmentStatus,
);

export default equipmentRoute;
