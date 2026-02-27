import {Request,Response, NextFunction } from "express";
import { MESSAGES } from "../../constants/messages";
import { STATUS } from "../../constants/statuscode";
import { IAdminUserService } from "../../interfaces/admin/admin.user-service.interface";
import { AdminBlockUnBlockUserDto, AdminGetUsersDto } from "../../dto/admin/admin-user.dto";

export class AdminUserController{
    constructor(private _adminUserService:IAdminUserService){}

    getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as AdminGetUsersDto;
      const data = await this._adminUserService.fetchUsers(query);
   
      res.status(STATUS.OK).json({
        success: true,
        message:MESSAGES.USER.PROFILE_FETCHED,
        data:data.data,
        pagination:data.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;

      await this._adminUserService.blockUser(userId);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.ADMIN.USER_BLOCKED,
      });
    } catch (error) {
      next(error);
    }
  };

  unblockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;

      await this._adminUserService.unblockUser(userId);

      res.status(STATUS.OK).json({
        success: true,
        message:  MESSAGES.ADMIN.USER_UNBLOCKED,
      });
    } catch (error) {
      next(error);
    }
  };

}