import { UNITS } from "@/constants/fitness.constant";
import { STATUS } from "@/constants/statuscode";
import { MESSAGES } from "@/constants/messages";
import { UpdateBmiDto, UpdateBmiResponseDto } from "@/dto/user/user.dto";
import { AppError } from "@/utils/appError";
import { IHealthMetrics } from "@/interfaces/service-interface/health.metrics/health.metrics-service.interface";

export class HealthMetricsService implements IHealthMetrics {
  async bmiCalculator(data: UpdateBmiDto): Promise<UpdateBmiResponseDto> {
    const { height, weight, unit, heightFt, heightIn } = data;

    if (UNITS.METRIC !== unit && UNITS.IMPERIAL !== unit) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.INVALID_UNIT_TYPE);
    }

    let finalBmi = 0;
    let finalHeight = 0;
    let finalWeight = 0;

    if (UNITS.METRIC === unit) {
      if (!height || !weight) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.METRIC_REQUIRED);
      }

      const h = Number(height) / 100;

      finalBmi = parseFloat((Number(weight) / (h * h)).toFixed(1));
      finalHeight = Number(height);
      finalWeight = Number(weight);

    } else {
      const totalInches = Number(heightFt || 0) * 12 + Number(heightIn || 0);
      if (!totalInches || !weight) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.IMPERIAL_REQUIRED);
      }
      finalBmi = parseFloat(
        ((Number(weight) / (totalInches * totalInches)) * 703).toFixed(1)
      );
      finalHeight = Math.round(totalInches * 2.54);
      finalWeight = parseFloat((Number(weight) * 0.453592).toFixed(1));
    }

    // Determine category
    let categoryLabel = "Obese";
    let categoryColor = "text-red-400";
    if (finalBmi < 18.5) {
      categoryLabel = "Underweight";
      categoryColor = "text-blue-400";
    } else if (finalBmi < 25) {
      categoryLabel = "Normal Weight";
      categoryColor = "text-green-400";
    } else if (finalBmi < 30) {
      categoryLabel = "Overweight";
      categoryColor = "text-yellow-400";
    }

    return {
      bmi: finalBmi,
      heightCm: finalHeight,
      weightKg: finalWeight,
      category: {
        label: categoryLabel,
        color: categoryColor,
      },
    };
  }
}
