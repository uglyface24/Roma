
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRomanticMessage = async (name: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, incredibly sweet, and slightly poetic message for a girl named ${name} who just agreed to be my Valentine. Keep it under 60 words and make it feel personal and heartfelt.`,
      config: {
        temperature: 0.9,
      }
    });
    return response.text || "I am the luckiest person in the world to have you. ❤️";
  } catch (error) {
    console.error("Error generating message:", error);
    return "You've made me the happiest person alive! I can't wait to spend Valentine's Day with you. ❤️";
  }
};
