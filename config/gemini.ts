import { GoogleGenAI } from "@google/genai";
import { geminiApiKey } from "./env.js";

const googleGenAI = new GoogleGenAI({
  apiKey: geminiApiKey,
});

export default googleGenAI;

