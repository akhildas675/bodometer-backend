import axios from "axios";

export interface MealMacroEstimate {
  correctedMeal: string;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
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
        console.log(`[AI] Requesting model: ${model} (Attempt ${attempt}/${retries})...`);
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
            const retryInfo = details.find((d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo");

            const isQuotaExceeded = errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("exhaust");

            if (isQuotaExceeded) {
              console.warn(`[AI] Quota exceeded for model ${model}. Fallback immediately.`);
              break;
            }

            if (retryInfo && retryInfo.retryDelay) {
              const seconds = parseFloat(retryInfo.retryDelay);
              if (!isNaN(seconds)) {
                const waitMs = seconds * 1000 + 1000;
                console.log(`[AI] Model requested delay of ${retryInfo.retryDelay}. Waiting ${waitMs}ms...`);
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

export class AiHealthService {
  async estimateMealMacros(description: string): Promise<MealMacroEstimate> {
    const prompt = `You are an expert AI nutritionist. Your task is to estimate the macros for the following meal description: "${description}".

CRITICAL RULES:
1. Provide a realistic estimate of Calories (kcal), Protein (g), Carbs (g), and Fat (g).
2. Clean up and format the name of the meal nicely in the "correctedMeal" field.
3. If the user input is completely nonsensical and clearly not food (e.g. "asdfg" or "1 car"), return 0 for all macros and "Unknown Food" for correctedMeal.
4. Respond ONLY with valid JSON. Do not include markdown formatting or extra text.

EXPECTED FORMAT:
{
  "correctedMeal": "2 Egg Curry and 4 Chapati",
  "estimatedCalories": 650,
  "estimatedProtein": 25,
  "estimatedCarbs": 80,
  "estimatedFat": 20
}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const response = await makeAiRequestWithFallback(payload);

    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("Failed to estimate macros: Empty response from AI model");
    }

    try {
      const cleanJson = this.cleanJsonString(textResponse);
      const parsedData = JSON.parse(cleanJson) as MealMacroEstimate;
      
      return {
        correctedMeal: parsedData.correctedMeal || description,
        estimatedCalories: parsedData.estimatedCalories || 0,
        estimatedProtein: parsedData.estimatedProtein || 0,
        estimatedCarbs: parsedData.estimatedCarbs || 0,
        estimatedFat: parsedData.estimatedFat || 0,
      };
    } catch (error) {
      throw new Error(`Failed to parse AI macro response: ${(error as Error).message}. Raw response: ${textResponse}`);
    }
  }

  async estimateBatchMealMacros(descriptions: string[]): Promise<MealMacroEstimate[]> {
    if (descriptions.length === 0) return [];

    const descriptionsList = descriptions.map((desc, i) => `${i + 1}. "${desc}"`).join("\n");

    const prompt = `You are an expert AI nutritionist. Your task is to estimate the macros for the following list of meal descriptions.

MEAL DESCRIPTIONS:
${descriptionsList}

CRITICAL RULES:
1. Provide a realistic estimate of Calories (kcal), Protein (g), Carbs (g), and Fat (g) for EACH meal.
2. Clean up and format the name of the meal nicely in the "correctedMeal" field.
3. If the user input is completely nonsensical and clearly not food (e.g. "asdfg" or "1 car"), return 0 for all macros and "Unknown Food" for correctedMeal.
4. Respond ONLY with valid JSON containing an array of objects in the EXACT SAME ORDER as the input list. Do not include markdown formatting or extra text.

EXPECTED FORMAT:
[
  {
    "correctedMeal": "2 Egg Curry and 4 Chapati",
    "estimatedCalories": 650,
    "estimatedProtein": 25,
    "estimatedCarbs": 80,
    "estimatedFat": 20
  }
]`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const response = await makeAiRequestWithFallback(payload);

    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("Failed to estimate macros: Empty response from AI model");
    }

    try {
      const cleanJson = this.cleanJsonString(textResponse);
      const parsedData = JSON.parse(cleanJson) as MealMacroEstimate[];
      
      if (!Array.isArray(parsedData) || parsedData.length !== descriptions.length) {
         throw new Error("Parsed data is not an array of the correct length");
      }

      return parsedData.map((data, index) => ({
        correctedMeal: data.correctedMeal || descriptions[index],
        estimatedCalories: data.estimatedCalories || 0,
        estimatedProtein: data.estimatedProtein || 0,
        estimatedCarbs: data.estimatedCarbs || 0,
        estimatedFat: data.estimatedFat || 0,
      }));
    } catch (error) {
      console.error(`Failed to parse AI batch macro response: ${(error as Error).message}. Raw response: ${textResponse}`);
      // Return empty objects if it fails, so they don't break the app
      return descriptions.map(desc => ({
        correctedMeal: desc,
        estimatedCalories: 0,
        estimatedProtein: 0,
        estimatedCarbs: 0,
        estimatedFat: 0
      }));
    }
  }

  private cleanJsonString(input: string): string {
    // 1. Try to find content within markdown code blocks: ```json ... ``` or ``` ... ```
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = input.match(codeBlockRegex);
    if (match && match[1]) {
      return match[1].trim();
    }

    // 2. Determine if the structure is an array or object based on which bracket starts first
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

}
