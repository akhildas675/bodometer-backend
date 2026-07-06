import axios from "axios";

export interface GenerateDietDto {
  dayNumber: number;
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  recommendedFoods: string;
}

export interface DietWeekPlanResponse {
  weekPlan: GenerateDietDto[];
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

          console.warn(`[AI Diet] Model ${model} failed (status=${status}): ${errMsg}`);

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
              console.warn(`[AI Diet] Quota exceeded for model ${model}. Fallback immediately.`);
              break;
            }

            if (retryInfo && retryInfo.retryDelay) {
              const seconds = parseFloat(retryInfo.retryDelay);
              if (!isNaN(seconds)) {
                const waitMs = seconds * 1000 + 1000;
                console.log(
                  `[AI Diet] Model requested delay of ${retryInfo.retryDelay}. Waiting ${waitMs}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, waitMs));
                attempt++;
                continue;
              }
            }

            const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            console.log(`[AI Diet] Rate limited. Waiting ${Math.round(backoff)}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, backoff));
            attempt++;
            continue;
          }
        } else {
          console.warn(`[AI Diet] Model ${model} failed with non-axios error`);
        }
        break; 
      }
    }
  }

  throw lastError || new Error("All models failed or quota exceeded");
}

export class AiDietService {
  async generateDietPlan(userAnswers: Record<string, unknown>): Promise<DietWeekPlanResponse> {
    const promptText = `
      You are an expert nutritionist and fitness coach. Based on the following user profile answers, generate a personalized 7-day diet plan.
      
      User Profile Answers:
      ${JSON.stringify(userAnswers, null, 2)}
      
      CRITICAL INSTRUCTIONS:
      - We only need the daily macro goals. Do NOT include any meal suggestions or food preferences.
      - We DO need a general small recommendation note (e.g. "Chicken, egg, spinach, sweet potato") to give the user ideas of what to eat to hit these macros based on their answers, but do not suggest full recipes. Limit to max 15 words.
      - Return ONLY a valid JSON object matching the TypeScript structure below. No markdown, no explanations, no text outside the JSON.
      
      Structure required:
      {
        "weekPlan": [
          {
            "dayNumber": 1,
            "day": "Day 1",
            "calories": 2000,
            "protein": 150,
            "carbs": 200,
            "fats": 65,
            "recommendedFoods": "Chicken breast, egg whites, sweet potato, almonds"
          }
          // ... repeat for all 7 days ...
        ]
      }
    `;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    };

    try {
      const response = await makeAiRequestWithFallback(payload);
      const data = response.data;

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("AI response format error:", JSON.stringify(data, null, 2));
        throw new Error("Invalid response format from AI");
      }

      const text = data.candidates[0].content.parts[0].text;
      
      let parsedResponse: DietWeekPlanResponse;
      try {
        const cleanText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        parsedResponse = JSON.parse(cleanText) as DietWeekPlanResponse;
      } catch (parseError) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("AI returned malformed JSON");
      }

      return parsedResponse;
    } catch (error) {
      const err = error as Error;
      console.error("Failed to generate diet plan:", err.message);
      throw new Error(`AI Diet Generation failed: ${err.message}`);
    }
  }
}
