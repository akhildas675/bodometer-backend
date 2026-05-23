import { BodyRegion } from "@/constants/fitness.constant";

export interface TargetMuscle {
    _id?: string;
    key: string;
    title: string;
    description: string;
    image: string;
    bodyRegion: BodyRegion;
    isActive?: boolean;
}