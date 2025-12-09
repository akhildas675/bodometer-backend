export interface RegisterUserDto {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword:string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  userName:string;
  phoneNumber: string;
  role: "user" | "trainer" | "admin";
  profilePic?: string | null;
}