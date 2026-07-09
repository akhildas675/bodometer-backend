import { UNITS } from "@/constants/constant.values.ts/fitness.constant";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { UpdateBmiDto, UpdateBmiResponseDto } from "@/modules/user/dto/user.dto";
import { AppError } from "@/utils/appError";
import { IHealthMetrics } from '@/modules/health-metrics/interface/health.metrics-service.interface';

export class HealthMetricsService implements IHealthMetrics {
  bmiCalculator(data: UpdateBmiDto): Promise<UpdateBmiResponseDto> {
    const { height, weight, unit, heightFt, heightIn, gender } = data;

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

    // Calculate healthy weight range
    const heightInMeters = finalHeight / 100;
    const minKg = parseFloat((18.5 * (heightInMeters * heightInMeters)).toFixed(1));
    const maxKg = parseFloat((24.9 * (heightInMeters * heightInMeters)).toFixed(1));

    // Determine category details
    let categoryLabel = "Obese";
    let categoryColor = "text-red-400";
    let description = "Your BMI falls in the obese category. It is recommended to work with a healthcare provider or a certified personal trainer to establish a safe, progressive lifestyle plan.";
    let tips = [
      "Consult a physician before starting intensive programs",
      "Start with low-impact exercises to protect joints",
      "Focus on consistent, gradual lifestyle modifications"
    ];

    if (finalBmi < 18.5) {
      categoryLabel = "Underweight";
      categoryColor = "text-blue-400";
      description = "You are currently underweight. Gaining weight in a healthy manner through balanced nutrition and strength training is recommended to support muscle growth and overall strength.";
      tips = [
        "Focus on nutrient-dense meals",
        "Include strength training exercises",
        "Eat frequent, smaller meals with healthy fats"
      ];
      if (gender === "male") {
        tips.push("Focus on progressive overload in strength training to stimulate muscle hypertrophy");
      } else if (gender === "female") {
        tips.push("Ensure adequate intake of iron, calcium, and vitamin D alongside calorie-dense whole foods");
      }
    } else if (finalBmi < 25) {
      categoryLabel = "Normal Weight";
      categoryColor = "text-green-400";
      description = "Congratulations! You have a healthy body weight. Maintain this with a balanced whole-foods diet and regular physical activity to support energy and metabolic health.";
      tips = [
        "Maintain a balanced diet of whole foods",
        "Aim for 150 minutes of moderate activity weekly",
        "Stay hydrated and prioritize quality sleep"
      ];
      if (gender === "male") {
        tips.push("Include a mix of resistance and progressive resistance exercises for strength maintenance");
      } else if (gender === "female") {
        tips.push("Add weight-bearing activities to help preserve bone density over time");
      }
    } else if (finalBmi < 30) {
      categoryLabel = "Overweight";
      categoryColor = "text-yellow-400";
      description = "You are in the overweight range. Incorporating daily active lifestyle habits, portion control, and cardiovascular exercises can help guide your body back to a healthier weight.";
      tips = [
        "Practice mindful portion control",
        "Incorporate daily moderate exercise (brisk walks, cycling)",
        "Reduce intake of highly processed sugar and fats"
      ];
      if (gender === "male") {
        tips.push("Incorporate structured weightlifting to preserve lean body mass while lowering body fat");
      } else if (gender === "female") {
        tips.push("Combine moderate aerobic work with resistance training to support steady fat loss and heart health");
      }
    } else {
      if (gender === "male") {
        tips.push("Engage in joint-friendly resistance exercises under guidance to boost lean tissue");
      } else if (gender === "female") {
        tips.push("Prioritize lower-impact activities (swimming, elliptical) to protect joint health");
      }
    }

    return Promise.resolve({
      bmi: finalBmi,
      heightCm: finalHeight,
      weightKg: finalWeight,
      gender,
      category: {
        label: categoryLabel,
        color: categoryColor,
        description,
        tips,
      },
      healthyWeightRange: {
        minKg,
        maxKg,
      },
    });
  }
}
