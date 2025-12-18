import { LoginUserDto, RegisterUserDto, RegisterResponseDto, LoginResponseDto } from "../../dto/user/user-auth.dto";
import { IAuthService } from "../../interfaces/user/IAuthServices";
import { IUserRepository } from "../../interfaces/user/IUserInterface";
import bcrypt from "bcrypt";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import { Jwt } from "../../utils/jwt.utils";
import { AccessTokenPayload, RefreshTokenPayload } from "../../interfaces/userInterfaces/userInterface";


export class AuthUserService implements IAuthService {
  constructor(private userRepo: IUserRepository) { }

  async registerUser(data: RegisterUserDto): Promise<RegisterResponseDto> {
    if (!data.email) {
      throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.REGISTER.INVALID_EMAIL_FORMAT);
    }

    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError(409, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const normalizedEmail = data.email.toLowerCase().trim();
    const parts = normalizedEmail.split("@");
    if (!parts[0]) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.REGISTER.INVALID_EMAIL_FORMAT);
    }

    const baseUsername = parts[0];
    let username = baseUsername;
    let counter = 1;

    while (await this.userRepo.findByUsername(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const user = await this.userRepo.createUser({
      name: data.name.trim(),
      userName: username,
      email: normalizedEmail,
      phoneNumber: data.phoneNumber,
      password: hashedPassword,
      role: "user",
      isBlocked: false,
      id: ""
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userName: user.userName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profilePic: user.profilePic ?? null,
    };
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
