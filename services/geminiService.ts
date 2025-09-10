
import { GoogleGenAI, Type } from "@google/genai";
import type { GrammarError, TranslationResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const grammarCheckSchema = {
  type: Type.OBJECT,
  properties: {
    errors: {
      type: Type.ARRAY,
      description: "A list of grammatical errors found in the text.",
      items: {
        type: Type.OBJECT,
        properties: {
          errorText: {
            type: Type.STRING,
            description: "The exact text phrase that is incorrect."
          },
          explanation: {
            type: Type.STRING,
            description: "A brief explanation of why this is an error."
          },
          suggestions: {
            type: Type.ARRAY,
            description: "A list of 2 to 4 corrected phrases.",
            items: { type: Type.STRING }
          }
        },
        required: ["errorText", "explanation", "suggestions"],
      }
    }
  },
  required: ["errors"],
};

const translationSchema = {
  type: Type.OBJECT,
  properties: {
    directTranslation: {
      type: Type.STRING,
      description: "A direct, literal translation of the text."
    },
    improvedTranslation: {
      type: Type.STRING,
      description: "An improved, more natural-sounding, and contextually appropriate translation that flows well."
    }
  },
  required: ["directTranslation", "improvedTranslation"],
};

export const checkGrammar = async (text: string): Promise<GrammarError[]> => {
  try {
    const prompt = `Analyze the following English text for grammatical errors, spelling mistakes, and awkward phrasing. Identify each error and provide a brief explanation and multiple correction suggestions. Here is the text: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: grammarCheckSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    return parsed.errors || [];
  } catch (error) {
    console.error("Error checking grammar:", error);
    return [];
  }
};

export const translateText = async (text: string, language: string): Promise<TranslationResult | null> => {
  try {
    const prompt = `Translate the following text to ${language}. Provide two versions: a direct translation, and an improved version that sounds more natural and fluent to a native speaker. Text: "${text}"`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: translationSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error translating text:", error);
    return null;
  }
};
