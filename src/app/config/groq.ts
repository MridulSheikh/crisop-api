import Groq from "groq-sdk";
import config from ".";

export const groq = new Groq({
  apiKey: config.GROQ_API_KEY
});

export const groqAiModel =  "llama-3.3-70b-versatile"