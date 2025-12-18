export interface RegisterUserDto {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
 
}

export interface RegisterResponseDto {
  id: string;
  name: string;
  email: string;
  userName:string;
  phoneNumber: string;
  role: "user" | "trainer" | "admin";
  profilePic: string | null;
}


export interface LoginUserDto{
  email:string;
  password:string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken?: string;  
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: "user" | "trainer" | "admin";
    profilePic?: string | null;
  };
}
