import { GoogleGenAI } from "@google/genai";
import config from ".";

export const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
export const model = 'gemini-2.5-flash';