export type Gender = "male" | "female" | "other" | "prefer_not_say";
export type UserRole = "user" | "trainer" | "admin";

export interface IUser {
  id?: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  profilePic?: string | null;
  gender?: Gender | null;
  role: UserRole;
  dateOfBirth?: Date | null;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
