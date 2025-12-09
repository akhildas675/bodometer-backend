import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../../../interfaces/user/IAuthServices";
import { RegisterUserDto } from "../../../dto/user/user-auth.dto";

export class UserAuthController {
    constructor(private authService: IAuthService) { }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = req.body as unknown as RegisterUserDto;
            console.log("User Register data........",body)
            const user = await this.authService.registerUser(body);

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            });

        } catch (error) {
            next(error)
        }
    }
}