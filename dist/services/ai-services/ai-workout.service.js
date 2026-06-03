"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWorkoutPrompt = exports.AiWorkoutService = void 0;
const axios_1 = __importDefault(require("axios"));
class AiWorkoutService {
    async generateWorkoutPlan(payload) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not defined in environment variables");
        }
        const prompt = (0, exports.buildWorkoutPrompt)(payload);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await axios_1.default.post(url, {
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
            const parsedData = JSON.parse(cleanJson);
            const { randomUUID } = await import("crypto");
            if (parsedData.weekPlan) {
                for (const day of parsedData.weekPlan) {
                    if (day.exercises) {
                        for (const ex of day.exercises) {
                            // Inject a unique instance ID for circuit-repetition tracking
                            ex.instanceId = randomUUID();
                        }
                    }
                }
            }
            return parsedData;
        }
        catch (error) {
            throw new Error(`Failed to parse AI workout plan response: ${error.message}. Raw response: ${textResponse}`);
        }
    }
}
exports.AiWorkoutService = AiWorkoutService;
function cleanJsonString(input) {
    let cleaned = input.trim();
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, "");
    }
    if (cleaned.endsWith("```")) {
        cleaned = cleaned.replace(/\s*```$/, "");
    }
    return cleaned.trim();
}
const buildWorkoutPrompt = (payload) => {
    const { previousPlansCount, completedWorkoutDaysTotal } = payload;
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayOfWeek = daysOfWeek[new Date().getDay()];
    // Infer experience tier from how many workout days the user has actually completed
    let experienceTier;
    let experienceGuidance;
    if (completedWorkoutDaysTotal === 0) {
        experienceTier = "ABSOLUTE_BEGINNER";
        experienceGuidance = `
- This user has NEVER completed a workout day with this app before. Treat them as an absolute beginner.
- Use ONLY beginner-difficulty exercises (difficulty: "beginner").
- Do NOT include any intermediate or advanced exercises regardless of what the user says their fitness level is.
- Keep sets low (2–3 sets), reps moderate (10–15), rest periods exactly 30s.
- Focus on foundational compound movements and bodyweight exercises.
- Do not overwhelm — safety and correct form take priority over intensity.`;
    }
    else if (completedWorkoutDaysTotal <= 10) {
        experienceTier = "EARLY_STAGE";
        experienceGuidance = `
- This user has completed ${completedWorkoutDaysTotal} workout day(s). They are still in the early stages.
- Primarily use beginner exercises, with at most 1–2 intermediate exercises per workout day.
- Keep sets at 3, reps at 10–12, rest strictly at 30s.
- Begin introducing slightly more variety but prioritise form and consistency.`;
    }
    else if (completedWorkoutDaysTotal <= 30) {
        experienceTier = "INTERMEDIATE";
        experienceGuidance = `
- This user has completed ${completedWorkoutDaysTotal} workout days. They are an intermediate-level athlete.
- Use a mix of beginner and intermediate exercises. Advanced exercises can appear sparingly (1 per day max).
- Sets: 3–4, Reps: 8–12, Rest: 30s.
- Begin periodisation — vary volume and intensity across the week.`;
    }
    else {
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

2. EXERCISE SOURCE AND SELECTION: 
   - Use ONLY exercises from AVAILABLE_EXERCISES. NEVER invent or hallucinate new exercises.
   - Do NOT just randomly add every available exercise into the plan. Select ONLY the exercises that are strictly necessary and highly relevant to the user's goals and current data.

3. EXERCISE COUNT PER WORKOUT DAY:
   - Every "workout" type day MUST have a minimum of 10 exercises and a STRICT maximum of 19 exercises (less than 20).
   - "rest" type days MUST have 0 exercises.
   - You MUST deeply analyze the user's data (experience tier, session duration, goals) to determine the exact number of exercises needed within this 10-19 range. Do not arbitrarily maximize the count; provide only what is highly effective and necessary based on a full data analysis.

4. VOLUME AND REPETITION STRATEGY (CIRCUIT STYLE):
   - ESPECIALLY FOR BEGINNERS: Do NOT group exercises into high-set blocks (e.g., 3 sets of 10 reps). High sets in one go can be too difficult.
   - Instead, reduce the sets and increase the reps per block (e.g., 1 set of 15 reps). 
   - To achieve the necessary volume, list the SAME exercise multiple times throughout the same workout day, acting like a circuit. For example: list "Incline Push Up" for 1 set of 15 early in the workout, and then add "Incline Push Up" AGAIN later in the exact same day's list for another 1 set of 15.

5. DIFFICULTY CALIBRATION:
   - Match exercise difficulty strictly to the USER EXPERIENCE PROFILE above and their onboarding fitness level.
   - A beginner user must NEVER receive advanced or intermediate exercises.

6. WORKOUT DAYS: The number of workout days MUST exactly match the user's selected "workoutDaysPerWeek" from their answers, WITH ONE EXCEPTION: If the user selected 7 days, you MUST limit it to 6 workout days and force at least 1 "rest" day to prevent overtraining.
   The remaining days in the 7-day week must be rest days.

6. MUSCLE GROUP BALANCE: Do NOT train the same primary muscle group on consecutive days.

7. DURATION: Match the estimated session duration strictly to the user's preferred session length from their answers.

8. ENVIRONMENT & EQUIPMENT: Only assign exercises appropriate for the user's workout environment and available equipment as stated in their answers.

9. FORMAT: Return STRICT JSON only. No markdown, no explanations, no text outside the JSON.

10. BMI CALCULATION & TAILORING: The USER ONBOARDING ANSWERS below include the user's gender, weight, and height. Calculate the user's BMI (Body Mass Index) internally based on these values. Use this calculated BMI and their gender to further tailor the difficulty, volume, and exercise selection of the workout plan (e.g. recommend lower-impact exercises if BMI is high).

11. TIME-BASED EXERCISES: If an exercise requires holding a position or doing it for time instead of reps (like a Plank or Wall Sit), you MUST omit the "reps" field and instead provide "durationSeconds" with the target time in seconds (e.g., 60). YOU MUST ALSO explicitly mention the time requirement in the "notes" field so the user clearly understands it is time-based (e.g., "Hold this position for 60 seconds").

12. ESTIMATED DURATION (CRITICAL NEW FEATURE): For EVERY exercise, you MUST provide an "estimatedDurationSeconds" field representing the total time in seconds it will take the user to complete the specified sets and reps/duration. 
    - Pacing rules: Slow/Beginner = ~4-5 seconds per rep. Fast/Advanced = ~2-3 seconds per rep.
    - Example: 1 set of 15 reps for a beginner = 15 * 4 = 60 seconds + 10s transition = 70. Output "estimatedDurationSeconds": 70.
    - For time-based exercises (e.g. 60s plank), "estimatedDurationSeconds" should equal the "durationSeconds".

13. DAY NAMES: The 7-day plan MUST start on TODAY's day of the week, which is ${currentDayOfWeek}. The first day of the plan (dayNumber 1) MUST be ${currentDayOfWeek}, dayNumber 2 MUST be the next day, and so on.

14. FIRST DAY MUST BE A WORKOUT: The very first day of the generated plan (dayNumber 1, ${currentDayOfWeek}) MUST ALWAYS be a "workout" day, NEVER a "rest" day. This ensures the user can start training immediately upon generating their plan.

15. SAFETY AND INJURY PREVENTION (AI RESPONSIBILITY): As an AI prescribing physical activity to a human, you MUST prioritize safety above all else. Do not prescribe dangerously high volume, excessive intensity, or extreme advanced movements (e.g., 1-rep maxes). Ensure adequate rest and recovery are baked into the plan so it is not over-harmful or exhausting.

16. PROGRESSIVE OVERLOAD & HISTORICAL ANALYSIS: You MUST deeply analyze the "PAST 4 WEEKS WORKOUT HISTORY" provided below (if any). Construct the next week's plan by applying progressive overload (e.g., slightly increasing sets, reps, or substituting for harder variations) and addressing any missed workouts. Build directly upon their recent past to ensure continuous improvement.

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
          "estimatedDurationSeconds": 160,
          "restSeconds": 60,
          "notes": "Keep core tight throughout"
        },
        {
          "order": 2,
          "exerciseId": "exercise_id_plank",
          "sets": 3,
          "durationSeconds": 60,
          "estimatedDurationSeconds": 60,
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
exports.buildWorkoutPrompt = buildWorkoutPrompt;
