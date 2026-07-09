import { BodyRegion } from "@/constants/constant.values.ts/fitness.constant";

export interface TargetMuscle {
    _id?: string;
    key: string;
    title: string;
    description: string;
    image: string;
    bodyRegion: BodyRegion;
    isActive?: boolean;
}
