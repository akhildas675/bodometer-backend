import { Role, ROLES } from "../../constants/identity.constants";



export interface AdminAccountInterface<R extends Role> {
  id: string;
  name: string;
  email: string;
  role: R;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
}

export type AdminUserInterface = AdminAccountInterface<typeof ROLES.USER>;

export interface AdminUserActionDto {
  userId: string;
}
