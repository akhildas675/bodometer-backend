import { UpdateBmiDto, UpdateBmiResponseDto } from "@/modules/user/dto/user.dto";

export interface IHealthMetrics {
    bmiCalculator: (data: UpdateBmiDto) => Promise<UpdateBmiResponseDto>;
}