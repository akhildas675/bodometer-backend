import axios from "axios";
import { WorkoutGenerationPayload } from "@/interfaces/domain.interface/ai.interface";
import { GenerateWorkoutDto } from "@/dto/exercise/exercise.dto";

import { IAiWorkoutService } from "@/interfaces/service-interface/ai/ai.workout-service.interface";

export interface WeekPlanResponse {
  weekPlan: GenerateWorkoutDto[];
}

export class AiWorkoutService implements IAiWorkoutService {
  async generateWorkoutPlan(payload: WorkoutGenerationPayload): Promise<WeekPlanResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    const prompt = buildWorkoutPrompt(payload);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    interface GeminiResponse {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    }

    const response = await axios.post<GeminiResponse>(url, {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("Failed to generate workout plan: Empty response from AI model");
    }

    try {
      const cleanJson = cleanJsonString(textResponse);
      return JSON.parse(cleanJson) as WeekPlanResponse;
    } catch (error) {
      throw new Error(`Failed to parse AI workout plan response: ${(error as Error).message}. Raw response: ${textResponse}`);
    }
  }
}

function cleanJsonString(input: string): string {
  let cleaned = input.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

export const buildWorkoutPrompt = (payload: WorkoutGenerationPayload) => {
  const { previousPlansCount, completedWorkoutDaysTotal } = payload;
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayOfWeek = daysOfWeek[new Date().getDay()];

  // Infer experience tier from how many workout days the user has actually completed
  let experienceTier: string;
  let experienceGuidance: string;

    if (completedWorkoutDaysTotal === 0) {
    experienceTier = "ABSOLUTE_BEGINNER";
    experienceGuidance = `
- This user has NEVER completed a workout day with this app before. Treat them as an absolute beginner.
- Use ONLY beginner-difficulty exercises (difficulty: "beginner").
- Do NOT include any intermediate or advanced exercises regardless of what the user says their fitness level is.
- Keep sets low (2–3 sets), reps moderate (10–15), rest periods exactly 30s.
- Focus on foundational compound movements and bodyweight exercises.
- Do not overwhelm — safety and correct form take priority over intensity.`;
  } else if (completedWorkoutDaysTotal <= 10) {
    experienceTier = "EARLY_STAGE";
    experienceGuidance = `
- This user has completed ${completedWorkoutDaysTotal} workout day(s). They are still in the early stages.
- Primarily use beginner exercises, with at most 1–2 intermediate exercises per workout day.
- Keep sets at 3, reps at 10–12, rest strictly at 30s.
- Begin introducing slightly more variety but prioritise form and consistency.`;
  } else if (completedWorkoutDaysTotal <= 30) {
    experienceTier = "INTERMEDIATE";
    experienceGuidance = `
- This user has completed ${completedWorkoutDaysTotal} workout days. They are an intermediate-level athlete.
- Use a mix of beginner and intermediate exercises. Advanced exercises can appear sparingly (1 per day max).
- Sets: 3–4, Reps: 8–12, Rest: 30s.
- Begin periodisation — vary volume and intensity across the week.`;
  } else {
    experienceTier = "EXPERIENCED";
    experienceGuidance = `
- This user has completed ${completedWorkoutDaysTotal} workout days. They are experienced.
- Use intermediate and advanced exercises freely. Prioritise progression and intensity.
- Sets: 4–5, Reps: 6–12, Rest: 30s.
- Apply advanced principles: supersets, drop sets, progressive overload notes.`;
  }

  return `You are an expert AI fitness coach with deep knowledge of exercise science and periodisation.

Your task is to generate a safe, personalized, and progressive 7-day workout plan.

══════════════════════════════════════
USER EXPERIENCE PROFILE
══════════════════════════════════════
Experience Tier: ${experienceTier}
Completed Workout Days: ${completedWorkoutDaysTotal}
Total Weeks Generated: ${previousPlansCount}
${experienceGuidance}

══════════════════════════════════════
CRITICAL RULES — MUST FOLLOW EXACTLY
══════════════════════════════════════

1. STRICT ADHERENCE TO ONBOARDING ANSWERS: You MUST deeply analyze the "USER ONBOARDING ANSWERS" section. Every single decision (exercise selection, focus, intensity, goal, workout days, duration) MUST strictly align with the user's specific answers and past workout history. DO NOT provide generic workouts; everything must be strictly tailored to their onboarding profile.

2. EXERCISE SOURCE: Use ONLY exercises from AVAILABLE_EXERCISES. NEVER invent or hallucinate new exercises.
   Every exerciseId in the response MUST be an id from AVAILABLE_EXERCISES.

3. EXERCISE COUNT PER WORKOUT DAY:
   - Every "workout" type day MUST have a minimum of 10 exercises and a maximum of 15 exercises.
   - "rest" type days MUST have 0 exercises.
   - Do NOT output fewer than 10 or more than 15 exercises on any workout day. This is a hard constraint.

4. DIFFICULTY CALIBRATION:
   - Match exercise difficulty strictly to the USER EXPERIENCE PROFILE above and their onboarding fitness level.
   - A beginner user must NEVER receive advanced or intermediate exercises.

5. WORKOUT DAYS: The number of workout days MUST exactly match the user's selected "workoutDaysPerWeek" from their answers.
   The remaining days in the 7-day week must be rest days.

6. MUSCLE GROUP BALANCE: Do NOT train the same primary muscle group on consecutive days.

7. DURATION: Match the estimated session duration strictly to the user's preferred session length from their answers.

8. ENVIRONMENT & EQUIPMENT: Only assign exercises appropriate for the user's workout environment and available equipment as stated in their answers.

9. FORMAT: Return STRICT JSON only. No markdown, no explanations, no text outside the JSON.

10. BMI CALCULATION & TAILORING: The USER ONBOARDING ANSWERS below include the user's gender, weight, and height. Calculate the user's BMI (Body Mass Index) internally based on these values. Use this calculated BMI and their gender to further tailor the difficulty, volume, and exercise selection of the workout plan (e.g. recommend lower-impact exercises if BMI is high).

11. TIME-BASED EXERCISES: If an exercise requires holding a position or doing it for time instead of reps (like a Plank or Wall Sit), you MUST omit the "reps" field and instead provide "durationSeconds" with the target time in seconds (e.g., 60). YOU MUST ALSO explicitly mention the time requirement in the "notes" field so the user clearly understands it is time-based (e.g., "Hold this position for 60 seconds").

12. DAY NAMES: The 7-day plan MUST start on TODAY's day of the week, which is ${currentDayOfWeek}. The first day of the plan (dayNumber 1) MUST be ${currentDayOfWeek}, dayNumber 2 MUST be the next day, and so on.

13. FIRST DAY MUST BE A WORKOUT: The very first day of the generated plan (dayNumber 1, ${currentDayOfWeek}) MUST ALWAYS be a "workout" day, NEVER a "rest" day. This ensures the user can start training immediately upon generating their plan.

14. SAFETY AND INJURY PREVENTION (AI RESPONSIBILITY): As an AI prescribing physical activity to a human, you MUST prioritize safety above all else. Do not prescribe dangerously high volume, excessive intensity, or extreme advanced movements (e.g., 1-rep maxes). Ensure adequate rest and recovery are baked into the plan so it is not over-harmful or exhausting.

15. PROGRESSIVE OVERLOAD & HISTORICAL ANALYSIS: You MUST deeply analyze the "PAST 4 WEEKS WORKOUT HISTORY" provided below (if any). Construct the next week's plan by applying progressive overload (e.g., slightly increasing sets, reps, or substituting for harder variations) and addressing any missed workouts. Build directly upon their recent past to ensure continuous improvement.

══════════════════════════════════════
USER ONBOARDING ANSWERS
══════════════════════════════════════

${JSON.stringify(payload.answers, null, 2)}

══════════════════════════════════════
PAST 4 WEEKS WORKOUT HISTORY
══════════════════════════════════════

${payload.past4WeeksData ? JSON.stringify(payload.past4WeeksData, null, 2) : "No previous workout history available."}

══════════════════════════════════════
AVAILABLE EXERCISES
══════════════════════════════════════

${JSON.stringify(payload.availableExercises, null, 2)}

AVAILABLE EXERCISE FORMAT:
[
  {
    "id": "exercise_id",
    "key": "push_up",
    "title": "Push Up",
    "difficulty": "beginner",
    "isCompound": true,
    "workoutEnvironments": ["home", "gym"]
  }
]

══════════════════════════════════════
EXPECTED RESPONSE FORMAT
══════════════════════════════════════

{
  "weekPlan": [
    {
      "day": "Monday",
      "type": "workout",
      "focus": "Upper Body",
      "estimatedDurationMinutes": 50,
      "exercises": [
        {
          "order": 1,
          "exerciseId": "exercise_id",
          "sets": 3,
          "reps": 12,
          "restSeconds": 60,
          "notes": "Keep core tight throughout"
        },
        {
          "order": 2,
          "exerciseId": "exercise_id_plank",
          "sets": 3,
          "durationSeconds": 60,
          "restSeconds": 45,
          "notes": "Hold steady"
        }
      ]
    },
    {
      "day": "Tuesday",
      "type": "rest",
      "focus": "Recovery",
      "estimatedDurationMinutes": 0,
      "exercises": []
    }
  ]
}`;
};