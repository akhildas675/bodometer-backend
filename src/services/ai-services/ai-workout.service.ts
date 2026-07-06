import axios from "axios";
import { WorkoutGenerationPayload } from '@/modules/ai/interface/ai.interface';
import { GenerateWorkoutDto } from "@/modules/workout-plan/dto/workout-plan.dto";
import { IAiWorkoutService } from '@/modules/ai/interface/ai.workout-service.interface';

export interface WeekPlanResponse {
  weekPlan: GenerateWorkoutDto[];
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

interface GeminiErrorDetail {
  "@type": string;
  retryDelay?: string;
}

interface GeminiErrorResponse {
  error?: {
    code: number;
    message: string;
    status: string;
    details?: GeminiErrorDetail[];
  };
}

const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-2.5-pro",
];

async function makeAiRequestWithFallback(payload: unknown): Promise<{ data: GeminiResponse }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

  let lastError: Error | null = null;

  for (const model of FALLBACK_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const retries = 2;
    let attempt = 1;

    while (attempt <= retries) {
      try {
        return await axios.post<GeminiResponse>(url, payload);
      } catch (error: unknown) {
        if (error instanceof Error) {
          lastError = error;
        }

        if (axios.isAxiosError<GeminiErrorResponse>(error)) {
          const status = error.response?.status;
          const errMsg = error.response?.data?.error?.message || error.message;

          console.warn(`[AI] Model ${model} failed (status=${status}): ${errMsg}`);

          if (status && status !== 429 && status < 500) {
            throw error;
          }

          if (status === 429 || status === 503) {
            const details = error.response?.data?.error?.details || [];
            const retryInfo = details.find(
              (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
            );

            const isQuotaExceeded =
              errMsg.toLowerCase().includes("quota") ||
              errMsg.toLowerCase().includes("exhaust");

            if (isQuotaExceeded) {
              console.warn(`[AI] Quota exceeded for model ${model}. Fallback immediately.`);
              break;
            }

            if (retryInfo && retryInfo.retryDelay) {
              const seconds = parseFloat(retryInfo.retryDelay);
              if (!isNaN(seconds)) {
                const waitMs = seconds * 1000 + 1000;
                console.log(
                  `[AI] Model requested delay of ${retryInfo.retryDelay}. Waiting ${waitMs}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, waitMs));
                attempt++;
                continue;
              }
            }
          }
        }

        const delay = 1500 * attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt++;
      }
    }
  }

  throw lastError || new Error("AI request failed after exhausting all fallback models");
}

export class AiWorkoutService implements IAiWorkoutService {
  async generateWorkoutPlan(payload: WorkoutGenerationPayload): Promise<WeekPlanResponse> {
    const prompt = buildWorkoutPrompt(payload);

    const apiPayload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const response = await makeAiRequestWithFallback(apiPayload);

    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("Failed to generate workout plan: Empty response from AI model");
    }

    try {
      const cleanJson = cleanJsonString(textResponse);
      const parsedData = JSON.parse(cleanJson) as WeekPlanResponse;

      const { randomUUID } = await import("crypto");

      if (parsedData.weekPlan) {
        for (const day of parsedData.weekPlan) {
          if (day.exercises) {
            for (const ex of day.exercises) {
              ex.instanceId = randomUUID();
            }
          }
        }
      }

      return parsedData;
    } catch (error) {
      throw new Error(
        `Failed to parse AI workout plan response: ${(error as Error).message}. Raw response: ${textResponse}`
      );
    }
  }
}

function cleanJsonString(input: string): string {
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = input.match(codeBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }

  const firstBrace = input.indexOf("{");
  const firstBracket = input.indexOf("[");

  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    const lastBracket = input.lastIndexOf("]");
    if (lastBracket !== -1 && lastBracket > firstBracket) {
      return input.substring(firstBracket, lastBracket + 1).trim();
    }
  }

  if (firstBrace !== -1) {
    const lastBrace = input.lastIndexOf("}");
    if (lastBrace !== -1 && lastBrace > firstBrace) {
      return input.substring(firstBrace, lastBrace + 1).trim();
    }
  }

  return input.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: No answer keys or answer values are manually parsed here in TypeScript.
// The entire answers array is passed raw to the AI.
// The AI is responsible for reading and interpreting every answer by its
// questionKey label and answer value. This makes the prompt resilient to any
// admin-side changes to question keys or answer value strings.
// ─────────────────────────────────────────────────────────────────────────────

export const buildWorkoutPrompt = (payload: WorkoutGenerationPayload): string => {
  const { previousPlansCount, completedWorkoutDaysTotal, planType } = payload;

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayOfWeek = daysOfWeek[new Date().getDay()];

  // ─── FREE PLAN ─────────────────────────────────────────────────────────────
  if (planType === "FREE") {
    return `You are an expert AI fitness coach.
Your task is to generate a basic, beginner-friendly 7-day workout plan.

════════════════════════════════════════════════════════════════════
STEP 1 — READ THE ONBOARDING ANSWERS FIRST (MANDATORY)
════════════════════════════════════════════════════════════════════

The USER ONBOARDING ANSWERS section at the bottom of this prompt contains a JSON array.
Each item has a "questionKey" and an "answer". You must read this array before doing anything else.

From those answers, identify and use the following:

  A) WEEKLY WORKOUT FREQUENCY
     Look through the answers for the one whose answer is a whole number between 1 and 7.
     The question context will be about how many days per week the user can commit to working out.
     The user's selected workout frequency determines how many active workout days are included within the 7-day plan. Follow this EXACT pattern:
     - 1 workout day -> 1 workout day + 6 recovery days
     - 2 workout days -> 2 workout days + 5 recovery days
     - 3 workout days -> 3 workout days + 4 recovery days
     - 4 workout days -> 4 workout days + 3 recovery days
     - 5 workout days -> 5 workout days + 2 recovery days
     - 6 workout days -> 6 workout days + 1 recovery day
     - 7 workout days -> 6 workout days + 1 recovery day (Cap at 6 active days max, 1 day MUST be rest)
     ▸ NEVER use a hardcoded default. Use only the value from the answers.

  B) WORKOUT ENVIRONMENT
     Find the answer about where the user will work out (home, gym, outdoors, etc.).
     Assign ONLY exercises compatible with that environment.
     If it says "home" with "no equipment", use ONLY bodyweight exercises.

════════════════════════════════════════════════════════════════════
ABSOLUTE RULES — EVERY RULE MUST BE FOLLOWED EXACTLY
════════════════════════════════════════════════════════════════════

RULE 1 — WORKOUT DAY COUNT (CRITICAL):
  • Generate exactly WORKOUT_DAYS "workout" type days (derived from Step 1A above).
  • Generate exactly REST_DAYS "rest" type days.
  • Total days in weekPlan MUST equal exactly 7. Never 6. Never 8.
  • If the user chose 7 workout days → Generate exactly 6 workout days and 1 rest day. No exceptions.

RULE 2 — DAY ORDERING:
  • dayNumber 1 = ${currentDayOfWeek} (today). dayNumber 2 = tomorrow. And so on.
  • dayNumber 1 MUST always be a "workout" day.

RULE 3 — EXERCISE SOURCE:
  • Use ONLY exercises from AVAILABLE EXERCISES below.
  • Never invent or hallucinate exercises not in that list.
  • Only use exercises whose "workoutEnvironments" array includes the user's environment (Step 1B).

RULE 4 — EXERCISE COUNT PER WORKOUT DAY:
  • Every "workout" day MUST have a minimum of 12 exercises and a maximum of 20 exercises.
  • Never go below 12. Never go above 20.
  • Every "rest" day MUST have an empty exercises array [].

RULE 5 — VOLUME:
  • Sets: 2–3. Reps: 10–15. Rest: 60 seconds. Beginner-safe intensity.

RULE 6 — FOCUS FIELD:
  • Every workout day: non-empty "focus" (e.g., "Full Body Basics", "Core & Cardio").
  • Every rest day: non-empty "focus" with recovery guidance (e.g., "Recovery: Light Walk & Stretching").

RULE 7 — ESTIMATED DURATION (EVERY EXERCISE):
  • Every exercise MUST include "estimatedDurationSeconds".
  • Rep-based:  (reps × 4) × sets  +  restSeconds × (sets − 1)  +  10
  • Time-based: durationSeconds × sets  +  restSeconds × (sets − 1)

RULE 8 — TIME-BASED EXERCISES:
  • If the exercise is done for time (e.g., Plank): omit "reps", add "durationSeconds".
  • The "notes" field MUST state the duration (e.g., "Hold for 30 seconds").

RULE 9 — NO DUPLICATE EXERCISES IN A DAY:
  • Each exercise may appear at most once per workout day.

RULE 10 — MUSCLE GROUP BALANCE (for plans with < 7 workout days):
  • Do not train the same primary muscle group on consecutive workout days.

RULE 11 — MUSCLE GROUP ROTATION (for 6-day plans):
  • When 6 days are workout days, vary the focus each day so no single muscle group
    is trained on consecutive days (e.g., Upper / Lower / Core / Full Body / Cardio rotation).

RULE 12 — OUTPUT FORMAT:
  • Return STRICT valid JSON only. No markdown, no explanations, nothing outside the JSON.

════════════════════════════════════════════════════════════════════
USER ONBOARDING ANSWERS  ← READ THIS FIRST BEFORE GENERATING
════════════════════════════════════════════════════════════════════
${JSON.stringify(payload.answers, null, 2)}

════════════════════════════════════════════════════════════════════
AVAILABLE EXERCISES  ← ONLY THESE MAY BE USED
════════════════════════════════════════════════════════════════════
${JSON.stringify(payload.availableExercises, null, 2)}

════════════════════════════════════════════════════════════════════
EXPECTED RESPONSE FORMAT
════════════════════════════════════════════════════════════════════
{
  "weekPlan": [
    {
      "day": "${currentDayOfWeek}",
      "dayNumber": 1,
      "type": "workout",
      "focus": "Full Body Basics",
      "estimatedDurationMinutes": 18,
      "exercises": [
        {
          "order": 1,
          "exerciseId": "exercise_id",
          "sets": 2,
          "reps": 12,
          "estimatedDurationSeconds": 106,
          "restSeconds": 60,
          "notes": "Steady controlled pace"
        },
        {
          "order": 2,
          "exerciseId": "exercise_id_plank",
          "sets": 2,
          "durationSeconds": 30,
          "estimatedDurationSeconds": 90,
          "restSeconds": 45,
          "notes": "Hold for 30 seconds. Keep hips level."
        }
      ]
    },
    {
      "day": "Tuesday",
      "dayNumber": 2,
      "type": "rest",
      "focus": "Recovery: Light Walk & Stretching",
      "estimatedDurationMinutes": 0,
      "exercises": []
    }
  ]
}`;
  }

  // ─── PREMIUM PLAN — EXPERIENCE TIER ───────────────────────────────────────
  let experienceTier: string;
  let experienceGuidance: string;

  if (completedWorkoutDaysTotal === 0) {
    experienceTier = "ABSOLUTE_BEGINNER";
    experienceGuidance = `
EXPERIENCE GUIDANCE (Absolute Beginner — 0 completed workouts):
• Select ONLY exercises with difficulty: "beginner". Never assign intermediate or advanced exercises.
• Sets: 1–2 per exercise. Reps: 8–12. Rest: 60–90 seconds.
• Experience level affects ONLY sets, reps, rest, and exercise difficulty — NOT exercise count.
• Exercise count per day is governed by the user's preferred session duration (see Rule 3 below).`;
  } else if (completedWorkoutDaysTotal <= 10) {
    experienceTier = "EARLY_STAGE";
    experienceGuidance = `
EXPERIENCE GUIDANCE (Early Stage — ${completedWorkoutDaysTotal} completed workouts):
• Mostly beginner exercises. At most 1–2 intermediate exercises per workout day.
• Sets: 2–3. Reps: 10–12. Rest: 45–60 seconds.
• Experience level affects ONLY sets, reps, rest, and exercise difficulty — NOT exercise count.`;
  } else if (completedWorkoutDaysTotal <= 30) {
    experienceTier = "INTERMEDIATE";
    experienceGuidance = `
EXPERIENCE GUIDANCE (Intermediate — ${completedWorkoutDaysTotal} completed workouts):
• Mix of beginner and intermediate exercises. Up to 1 advanced exercise per day.
• Sets: 3–4. Reps: 8–12. Rest: 30–45 seconds.
• Apply progressive overload. Exercise count is governed by the user's preferred session duration.`;
  } else {
    experienceTier = "EXPERIENCED";
    experienceGuidance = `
EXPERIENCE GUIDANCE (Experienced — ${completedWorkoutDaysTotal} completed workouts):
• Intermediate and advanced exercises freely. Prioritize challenge and progressive overload.
• Sets: 3–5. Reps: 6–12. Rest: 30 seconds.
• Exercise count is governed by the user's preferred session duration.`;
  }

  // ─── PREMIUM PLAN PROMPT ──────────────────────────────────────────────────
  return `You are an expert AI fitness coach specializing in exercise science, biomechanics, and individualized programming.

Your ONLY task is to generate a strictly personalized 7-day workout plan.
Every decision MUST come exclusively from the USER ONBOARDING ANSWERS provided below.
Do NOT generate any generic, templated, or assumed content.

════════════════════════════════════════════════════════════════════
USER EXPERIENCE PROFILE  (pre-computed by the system)
════════════════════════════════════════════════════════════════════
Experience Tier              : ${experienceTier}
Completed Workout Days Total : ${completedWorkoutDaysTotal}
Total Plans Previously Made  : ${previousPlansCount}
${experienceGuidance}

════════════════════════════════════════════════════════════════════
STEP 1 — READ AND EXTRACT FROM ONBOARDING ANSWERS (DO THIS FIRST)
════════════════════════════════════════════════════════════════════

The USER ONBOARDING ANSWERS section at the bottom contains a JSON array.
Each item has a "questionKey" and an "answer".

Before writing a single exercise, extract ALL of the following from those answers:

  A) WEEKLY WORKOUT FREQUENCY
     Find the answer whose value is a whole number 1–7 representing days per week.
     The question context will be about weekly workout commitment or frequency.
     The user's selected workout frequency determines how many active workout days are included within the 7-day plan. Follow this EXACT pattern:
     - 1 workout day -> 1 workout day + 6 recovery days
     - 2 workout days -> 2 workout days + 5 recovery days
     - 3 workout days -> 3 workout days + 4 recovery days
     - 4 workout days -> 4 workout days + 3 recovery days
     - 5 workout days -> 5 workout days + 2 recovery days
     - 6 workout days -> 6 workout days + 1 recovery day
     - 7 workout days -> 6 workout days + 1 recovery day (Cap at 6 active days max, 1 day MUST be rest)
     ▸ Do NOT use any default. Read the value from the answers only.

  B) SESSION DURATION
     Find the answer about how long the user can work out per session.
     The answer will be a string describing a time range (e.g., something like
     "under_20_minutes", "20_30_minutes", "30_45_minutes", "45_60_minutes",
     "60_plus_minutes" — the exact format may vary; admin can change these strings).
     Parse the numeric range from the string regardless of separator style or word order.
     Use the midpoint or upper bound of that range as the target session length in minutes.
     Call this SESSION_MINUTES. Use it to determine exercise count per Rule 3 below.

  C) FITNESS GOALS
     Read the primary goal answer and all secondary goal answers.
     Use these to drive ALL exercise selection and day focus labels.
     Examples:
       lose_weight / burn_fat     → cardio-heavy, higher reps, short rest, aerobic movements
       muscle_gain / build_muscle → compound lifts, hypertrophy rep ranges (8–12)
       reduce_stress              → controlled-pace movements, breathing-friendly exercises
       cardiovascular_health      → sustained aerobic or interval-style exercises
       increase_energy            → dynamic, full-body compound movements

  D) WORKOUT ENVIRONMENT & EQUIPMENT
     Read the environment answer (home, gym, outdoors, etc.) and any equipment answers.
     Assign ONLY exercises compatible with that environment and those exact equipment items.
     If the answer indicates home with no equipment → bodyweight-only exercises.
     Never assign an exercise requiring equipment the user does not have.

  E) INJURIES & PHYSICAL LIMITATIONS
     Read any injury/limitation answers.
     If limitations exist, never assign exercises stressing the affected area.
     Add an explicit safety note in the "notes" field for nearby exercises.
     If the answer indicates no injuries, no special restriction applies.

  F) BIOLOGICAL SEX, WEIGHT, HEIGHT, DATE OF BIRTH
     Extract these values to calculate BMI: weight_kg / (height_m)^2.
     Use BMI, sex, and age to calibrate intensity and exercise selection internally.
     High BMI → prefer lower-impact, joint-friendly options.
     Do not output the BMI value in the response.

  G) PREFERRED WORKOUT TYPE
     Read what types of workouts the user enjoys (cardio, strength, yoga, HIIT, etc.).
     Prioritize exercises that align with those preferences when available.

════════════════════════════════════════════════════════════════════
ABSOLUTE RULES — EVERY RULE MUST BE FOLLOWED EXACTLY
════════════════════════════════════════════════════════════════════

RULE 1 — WORKOUT DAY COUNT (MOST CRITICAL):
  • Generate exactly WORKOUT_DAYS "workout" type days (from Step 1A).
  • Generate exactly REST_DAYS "rest" type days.
  • Total days in weekPlan = exactly 7. Never 6. Never 8.
  • If the user chose 7 workout days → Generate exactly 6 workout days and 1 rest day. No exceptions.
  • NEVER override this with a different value. The user's stated frequency is final (capped at 6 workouts).

RULE 2 — DAY ORDERING:
  • dayNumber 1 = ${currentDayOfWeek} (today). dayNumber 2 = tomorrow. Continuing in calendar order.
  • dayNumber 1 MUST always be a "workout" day, never a rest day.

RULE 3 — EXERCISE COUNT PER WORKOUT DAY:
  • Every "workout" day MUST contain a minimum of 12 exercises and a maximum of 20 exercises.
  • Never go below 12. Never go above 20.
  • Target the upper end of the range (closer to 20) for longer session durations and
    the lower end (closer to 12) for shorter session durations — but never drop below 12.
  • DO NOT reduce exercise count because the user is a beginner. Experience tier
    affects only sets, reps, rest, and difficulty — never the exercise count.
  • Every "rest" day MUST have an empty exercises array [].

RULE 4 — EXERCISE SOURCE:
  • Use ONLY exercises from AVAILABLE EXERCISES below.
  • Never invent, hallucinate, or reference any exercise not in that list.
  • Each selected exercise's "workoutEnvironments" MUST include the user's environment (Step 1D).

RULE 5 — EXPERIENCE TIER APPLICATION:
  Apply the sets/reps/rest/difficulty guidance from the USER EXPERIENCE PROFILE above.
  This affects difficulty, volume per exercise, and rest — not the number of exercises.

RULE 6 — MUSCLE GROUP BALANCE:
  • Never train the same primary muscle group on two consecutive workout days.
  • For high-frequency plans (5-6 days), rotate focus each day (e.g., Upper / Lower / Core / Full Body / Cardio)
    so no single muscle group is overloaded on back-to-back days.

RULE 7 — PROGRESSIVE OVERLOAD:
  • If PAST 4 WEEKS WORKOUT HISTORY is provided, analyse it carefully.
  • Increase ONE variable only: either reps OR sets OR exercise difficulty — never all at once.
  • If no history exists, set a safe baseline appropriate to the experience tier.

RULE 8 — FOCUS FIELD:
  • Every workout day MUST have a non-empty "focus" derived from the user's goals and
    that day's muscle group target (e.g., "Cardio & Fat Burn", "Upper Body Strength", "Core & Mobility").
  • Every rest day MUST have a non-empty "focus" with recovery guidance
    (e.g., "Recovery: Stretching & Hydration", "Active Recovery: Light Walk").

RULE 9 — TIME-BASED EXERCISES:
  • For exercises done for time rather than reps (e.g., Plank, Wall Sit):
    - Omit the "reps" field entirely.
    - Provide "durationSeconds" with the target time in seconds.
    - "notes" MUST explicitly state the duration (e.g., "Hold for 45 seconds").

RULE 10 — ESTIMATED DURATION (EVERY EXERCISE):
  • Every exercise MUST include "estimatedDurationSeconds".
  • Rep-based:   (reps × pace_s) × sets  +  restSeconds × (sets − 1)  +  10
    Pace: Beginner = 4–5 s/rep | Intermediate = 3–4 s/rep | Advanced = 2–3 s/rep
  • Time-based:  durationSeconds × sets  +  restSeconds × (sets − 1)

RULE 11 — NO DUPLICATE EXERCISES WITHIN A DAY:
  • Each exercise appears at most once per workout day.
  • Exception: intentional circuit — if used, state "Circuit round X" in the "notes" field.

RULE 12 — SAFETY:
  • Do not prescribe dangerous volume, 1-rep max attempts, or advanced movements
    for users whose experience tier does not support them.
  • Recovery days must be genuinely restful or lightly active — never a disguised workout.

RULE 13 — SESSION DURATION MATCH:
  • The "estimatedDurationMinutes" for each workout day MUST closely match SESSION_MINUTES.
  • Do not significantly exceed or fall short of the user's stated session length.

RULE 14 — OUTPUT FORMAT:
  • Return STRICT valid JSON only.
  • No markdown fences, no prose, no comments — nothing outside the JSON object.

════════════════════════════════════════════════════════════════════
USER ONBOARDING ANSWERS  ← PRIMARY SOURCE OF TRUTH — READ FIRST
════════════════════════════════════════════════════════════════════
${JSON.stringify(payload.answers, null, 2)}

════════════════════════════════════════════════════════════════════
PAST 4 WEEKS WORKOUT HISTORY  ← USE FOR PROGRESSIVE OVERLOAD
════════════════════════════════════════════════════════════════════
${payload.past4WeeksData ? JSON.stringify(payload.past4WeeksData, null, 2) : "No previous workout history available."}

════════════════════════════════════════════════════════════════════
AVAILABLE EXERCISES  ← ONLY THESE MAY BE USED
════════════════════════════════════════════════════════════════════
${JSON.stringify(payload.availableExercises, null, 2)}

AVAILABLE EXERCISE SCHEMA:
{
  "id": "exercise_id",
  "key": "push_up",
  "title": "Push Up",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "isCompound": true | false,
  "workoutEnvironments": ["home", "gym"]
}

════════════════════════════════════════════════════════════════════
EXPECTED RESPONSE FORMAT
════════════════════════════════════════════════════════════════════
{
  "weekPlan": [
    {
      "day": "${currentDayOfWeek}",
      "dayNumber": 1,
      "type": "workout",
      "focus": "<goal-aligned focus from onboarding>",
      "estimatedDurationMinutes": 18,
      "exercises": [
        {
          "order": 1,
          "exerciseId": "exercise_id",
          "sets": 2,
          "reps": 12,
          "estimatedDurationSeconds": 106,
          "restSeconds": 60,
          "notes": "Keep core tight throughout"
        },
        {
          "order": 2,
          "exerciseId": "exercise_id_plank",
          "sets": 2,
          "durationSeconds": 30,
          "estimatedDurationSeconds": 90,
          "restSeconds": 45,
          "notes": "Hold for 30 seconds. Keep hips level and breathe steadily."
        }
      ]
    },
    {
      "day": "Tuesday",
      "dayNumber": 2,
      "type": "rest",
      "focus": "Recovery: Stretching & Hydration",
      "estimatedDurationMinutes": 0,
      "exercises": []
    }
  ]
}`;
};