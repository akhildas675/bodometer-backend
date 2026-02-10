import { IAuthRepository } from "../../interfaces/auth/auth-repository.interface";
import { AppError } from "../../utils/appError";
import { IUsernameGenerator } from "./username-generator.interface";

export class EmailBasedUsernameGenerator implements IUsernameGenerator {
  constructor(private _authRepo: IAuthRepository) {}

  async generate(email: string): Promise<string> {
    const normalizedEmail = email.toLowerCase().trim();
    const baseUsername = normalizedEmail.split("@")[0];

    if (!baseUsername) {
      throw new AppError(400, "Invalid email format");
    }

    let userName = baseUsername;
    let counter = 1;

    while (await this._authRepo.findByUsername(userName)) {
      userName = `${baseUsername}${counter++}`;
    }

    return userName;
  }
}