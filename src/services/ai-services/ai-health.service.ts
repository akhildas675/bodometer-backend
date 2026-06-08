import axios from "axios";

export interface MealMacroEstimate {
  correctedMeal: string;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
}

export class AiHealthService {
  async estimateMealMacros(description: string): Promise<MealMacroEstimate> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

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
    };

    const response = await this.makeAiRequestWithRetry<GeminiResponse>(url, payload);

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

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

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const response = await this.makeAiRequestWithRetry<GeminiResponse>(url, payload);

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
    let cleaned = input.trim();
    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "");
    }
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, "");
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.replace(/\s*```$/, "");
    }
    return cleaned.trim();
  }

  private async makeAiRequestWithRetry<T>(url: string, payload: unknown): Promise<{ data: T }> {
    let retries = 3;
    let delay = 1500; // start with 1.5s delay
    
    while (retries > 0) {
      try {
        return await axios.post<T>(url, payload);
      } catch (error: unknown) {
        retries--;
        
        if (axios.isAxiosError(error)) {
          // If it's the last retry, or a non-retriable error (e.g. 400 Bad Request)
          if (retries === 0 || (error.response && error.response.status !== 429 && error.response.status < 500)) {
            throw error;
          }
          console.warn(`AI request failed with ${error.response?.status || error.message}. Retrying in ${delay}ms... (${retries} retries left)`);
        } else {
          if (retries === 0) throw error;
          console.warn(`AI request failed with unknown error. Retrying in ${delay}ms... (${retries} retries left)`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      }
    }
    throw new Error("AI request failed after max retries");
  }
}
