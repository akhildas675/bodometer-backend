import { NextFunction, Request, Response } from "express";
import { AdminServiceInterface } from "../../interfaces/admin/admin-service.interface";
import { AdminBlockUnBlockDto, AdminBlockUnblockTrainerDto, AdminGetTrainersDto, AdminGetUsersDto } from "../../dto/admin/admin.dto";
import { unknown } from "zod";


export class AdminController {
  constructor(private adminService: AdminServiceInterface) { }

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as AdminGetUsersDto
      const users = await this.adminService.fetchUsers(body);
      console.log(users)
      res.status(200).json({
        success: true,
        data: users
      })
    } catch (error) {
      next(error)
    }
  }

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockDto

      console.log("This is the user id for backend....", userId)

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

  getTrainers = async (req:Request,res:Response,next:NextFunction)=>{
    try {
      console.log("function worked get all trianers")
      const body = req.body as AdminGetTrainersDto;
      console.log("Trainers id from body",body)
      const trainers = await this.adminService.fetchTrainers(body)
      console.log(trainers)
      res.status(200).json({
        success:true,
        data:trainers
      })
    } catch (error) {
      next(error)
    }
  }


blockTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trainerId } = req.params as unknown as AdminBlockUnblockTrainerDto;


    console.log("This is the trainer id for backend....", trainerId);

    await this.adminService.blockTrainer(trainerId);

    res.status(200).json({
      success: true,
      message: "Trainer blocked successfully",
    });
  } catch (error) {
    next(error);
  }
};

unblockTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trainerId } = req.params as unknown as AdminBlockUnblockTrainerDto;

    console.log("This is the trainer id for backend....", trainerId);

    await this.adminService.unblockTrainer(trainerId);

    res.status(200).json({
      success: true,
      message: "Trainer unblocked successfully",
    });
  } catch (error) {
    next(error);
  }
};





}