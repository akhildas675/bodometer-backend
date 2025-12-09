import { RegisterUserDto, UserResponseDto } from "../../dto/user/user-auth.dto";
import { IAuthService } from "../../interfaces/user/IAuthServices";
import { IUserRepository } from "../../interfaces/user/IUserInterface";
import bcrypt from "bcrypt";
import { AppError } from "../../utils/appError";

export class AuthUserService implements IAuthService {
  constructor(private userRepo: IUserRepository) {}

  async registerUser(data: RegisterUserDto): Promise<UserResponseDto> {
  if (!data.email) {
    throw new AppError(400, "Email is required");
  }

  const existing = await this.userRepo.findByEmail(data.email);
  if (existing) {
    throw new AppError(409, "Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const normalizedEmail = data.email.toLowerCase().trim();
  const parts = normalizedEmail.split("@");
  if (!parts[0]) {
    throw new AppError(400, "Invalid email format");
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
}
