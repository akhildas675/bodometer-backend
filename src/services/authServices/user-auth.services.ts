import { LoginUserDto, RegisterUserDto, RegisterResponseDto, LoginResponseDto } from "../../dto/user/user-auth.dto";
import bcrypt from "bcrypt";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import { Jwt } from "../../utils/jwt.utils";
import { AccessTokenPayload, RefreshTokenPayload } from "../../interfaces/userInterfaces/userInterface";
import { OtpService } from "../otp/otp.services";
import { success } from "zod";
import { IUserRepository } from "../../interfaces/user/IUserRepository";
import { IAuthServices } from "../../interfaces/user/IAuthService";





export class AuthUserService implements IAuthServices {

  constructor(private userRepo: IUserRepository,
    private otpService: OtpService
  ) { }



  async initiateRegister(data: RegisterUserDto): Promise<void> {
    const existing = await this.userRepo.findByEmail(
      data.email.toLowerCase().trim()
    );

    if (existing) {
      throw new AppError(409, "Email already registered");
    }

    await this.otpService.generateAndSendOtp(
      data.email,
      "USER_REGISTER"
    );
  }

  async registerUser(
    data: RegisterUserDto
  ): Promise<RegisterResponseDto> {

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const normalizedEmail = data.email.toLowerCase().trim();
    const baseUsername = normalizedEmail.split("@")[0];

    if (!baseUsername) {
      throw new AppError(400, "Invalid email format");
    }

    let username = baseUsername;
    let counter = 1;

    while (await this.userRepo.findByUsername(username)) {
      username = `${baseUsername}${counter++}`;
    }

    const user = await this.userRepo.createUser({
      name: data.name.trim(),
      userName: username,
      email: normalizedEmail,
      phoneNumber: data.phoneNumber,
      password: hashedPassword,
      role: "user",
      isVerified: true,
      isBlocked: false,
      id: ""
    });

    return {
      id: user.id!,
      name: user.name,
      email: user.email,
      userName: user.userName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profilePic: user.profilePic ?? null,
    };
  }


  async resendOtp(email: string): Promise<void> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new AppError(404, "User already have account please Login")
    }
    await this.otpService.generateAndSendOtp(
      email,
      "USER_REGISTER"
    );
  }





  async loginUser(data: LoginUserDto): Promise<LoginResponseDto> {
    if (!data.email || !data.password) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.LOGIN.EMAIL_AND_PASSWORD_REQUIRED);
    }

    const user = await this.userRepo.findByEmail(data.email.toLowerCase().trim());
    if (!user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.LOGIN.USER_NOT_FOUND);

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.LOGIN.INVALID_CREDENTIALS);


    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      role: user.role,
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      role: user.role
    };

    const accessToken = Jwt.signAccess(accessPayload);
    const refreshToken = Jwt.signRefresh(refreshPayload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profilePic: user.profilePic ?? null,
      }
    };
  }


  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = Jwt.verifyRefresh(refreshToken);

    const accessPayload: AccessTokenPayload = {
      sub: payload.sub,
      role: payload.role,
    };

    const newAccessToken = Jwt.signAccess(accessPayload);

    return { accessToken: newAccessToken };
  }







}
