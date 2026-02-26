import { Router } from "express";
import { ADMIN_ROUTES } from "../../constants/routes.constant/admin-routes.constant";
import { createAdminUserModule } from "../../modules/admin/admin-user.module";
import { ROLE_GUARD } from "../../constants/role.guard";

const adminUserRoute = Router();
const {adminUserController}=createAdminUserModule()

// User Management
adminUserRoute.get(
  ADMIN_ROUTES.GET_USERS,
  ROLE_GUARD.ADMIN_GUARD,
  adminUserController.getUsers,
);

adminUserRoute.patch(
  ADMIN_ROUTES.BLOCK_USER,
  ROLE_GUARD.ADMIN_GUARD,
  adminUserController.blockUser,
);

adminUserRoute.patch(
  ADMIN_ROUTES.UNBLOCK_USER,
  ROLE_GUARD.ADMIN_GUARD,
  adminUserController.unblockUser,
);


export default adminUserRoute