import { Role } from "../../constants/identity.constants";
import { AdminGetUsersResponseDto } from "../../dto/admin/admin.dto";
import { AdminAccountInterface } from "../../interfaces/admin/admin.interface";

export class AdminAccountMapper {
  static toResponse<T extends Exclude<Role,"admin">>(
    account: AdminAccountInterface<T>
  ): AdminGetUsersResponseDto {
    return {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      isBlocked: account.isBlocked,
      isVerified: account.isVerified,
      createdAt: account.createdAt,
    };
  }

  static toResponseList<T extends Exclude<Role,"admin">>(
    accounts: AdminAccountInterface<T>[]
  ): AdminGetUsersResponseDto[] {
    return accounts.map((account) =>
      AdminAccountMapper.toResponse(account)
    );
  }
}
