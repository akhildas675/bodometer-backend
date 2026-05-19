import { UpdateBmiDto, UpdateBmiResponseDto } from "@/dto/user/user.dto";

export interface IHealthMetrics {
    bmiCalculator: (data: UpdateBmiDto) => Promise<UpdateBmiResponseDto>;
}