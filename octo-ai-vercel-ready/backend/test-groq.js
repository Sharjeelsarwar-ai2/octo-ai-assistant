import "dotenv/config";
import Groq from "groq-sdk";

const key = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

if (!key) {
  console.log("FAIL: GROQ_API_KEY not loaded from backend/.env");
  process.exit(1);
}

console.log("API key loaded:", Boolean(key));
console.log("Model:", model);

const groq = new Groq({ apiKey: key });

try {
  const response = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are Aara, an intelligent personal AI assistant." },
      { role: "user", content: "Who is the Prime Minister of India?" }
    ],
    temperature: 0.5,
    max_tokens: 500
  });

  const reply = response.choices?.[0]?.message?.content?.trim();
  console.log("\nSUCCESS: Groq API responded!");
  console.log("Response:", reply);
} catch (error) {
  console.log("FAILED: Groq request did not succeed");
  console.log("HTTP status:", error.status ?? error.statusCode ?? "unknown");
  console.log("Error:", error.message);
}
