
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const key = process.env.AI_API_KEY;
const model = process.env.AI_MODEL || "gemini-3.8-flash";

if (!key) {
    console.log("FAIL: AI_API_KEY not loaded from backend/.env");
    process.exit(1);
}

console.log("API key loaded:", Boolean(key));
console.log("Model:", model);

const ai = new GoogleGenAI({ apiKey: key });

try {
    const response = await ai.models.generateContent({
        model,
        contents: "Reply with exactly: AARA AI CONNECTED",
    });

    console.log("SUCCESS:", response.text);
} catch (error) {
    console.log("FAILED: Gemini request did not succeed");
    console.log("HTTP status:", error.status ?? error.statusCode ?? "unknown");
    console.log("Error:", error.message);
}
