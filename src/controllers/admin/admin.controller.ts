import { NextFunction, Request, Response } from "express";
import { AdminServiceInterface } from "../../interfaces/admin/admin-service.interface";
import { AdminBlockUnBlockDto, AdminGetUsersDto } from "../../dto/admin/admin.dto";


export class AdminController{
    constructor(private adminService:AdminServiceInterface) {}

    getUsers = async (req:Request,res:Response,next:NextFunction)=>{
        try {
            const body = req.body as AdminGetUsersDto
           const users = await this.adminService.fetchUsers(body);
           console.log(users)
            res.status(200).json({
                success:true,
                data:users
            })
        } catch (error) {
            next(error)
        }
    }

blockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as unknown as AdminBlockUnBlockDto

    console.log("This is the user id for backend....",userId)

    await this.adminService.blockUser(userId);

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    next(error);
  }
};

unblockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as unknown as AdminBlockUnBlockDto

    await this.adminService.unblockUser(userId);

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error) {
    next(error);
  }
};


}