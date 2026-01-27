export interface WorkoutListDto{
    id:string;
    workoutList:string;
}


export interface CreateTrainerProfileDto {
  experienceInYears: number;
  bio: string;
  certificateUrl: string;
}
export interface TrainerProfileResponseDto {
  success: true;
  message: string;
}

export interface GetTrainerAppointmentsResponseDto {
  user: {
    _id: string;
    name: string;
    userName: string;
    email: string;
    phoneNumber: string;
    profilePic: string | null;
    gender: string;
    role: string;
    isVerified: boolean;
    dateOfBirth: string | null;
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
  profile: {
    _id: string;
    userId: string;
    experienceInYears: number;
    certifications: string[];
    bio: string;
    verificationStatus: string;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
  };
}


export interface GetTrainerByIdRequestDto {
  userId: string;
}

export interface GetTrainerByIdResponseDto {
  user: {
    _id: string;
    name: string;
    userName: string;
    email: string;
    phoneNumber: string;
    profilePic: string | null;
    gender: string;
    role: string;
    isVerified: boolean;
    dateOfBirth: string | null;
    isBlocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
  profile: {
    _id: string;
    userId: string;
    experienceInYears: number;
    certifications: string[];
    bio: string;
    verificationStatus: string;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
  };
}


export interface ApproveTrainerRequestDto {
  profileId: string;
}

export interface ApproveTrainerResponseDto {
  message: string;
  profile: {
    _id: string;
    verificationStatus: string;
  };
}


export interface RejectTrainerRequestDto {
  profileId: string;
  reason: string;
}

export interface RejectTrainerResponseDto {
  message: string;
  profile: {
    _id: string;
    verificationStatus: string;
    rejectionReason: string;
  };
}