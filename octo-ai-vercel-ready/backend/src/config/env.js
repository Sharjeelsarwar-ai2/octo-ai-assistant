import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Search multiple possible locations for .env
const candidatePaths = [
  path.resolve(__dirname, '../../.env'),           // backend/.env
  path.resolve(__dirname, '../../../server/.env'), // server/.env
  path.resolve(__dirname, '../../../.env')         // root .env
];

let loadedPath = null;
for (const envPath of candidatePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    loadedPath = envPath;
    break;
  }
}

// Fallback to default dotenv if none found
if (!loadedPath) {
  dotenv.config();
}

// Determine configured provider (default to 'groq' if GROQ_API_KEY is present or AI_PROVIDER is set)
const configuredProvider = (
  process.env.AI_PROVIDER ||
  (process.env.GROQ_API_KEY ? 'groq' : process.env.AI_API_KEY ? 'gemini' : 'demo')
).toLowerCase().trim();

// Resolve Groq specific configurations
const groqApiKey = (
  process.env.GROQ_API_KEY ||
  (process.env.AI_API_KEY?.startsWith('gsk_') ? process.env.AI_API_KEY : '') ||
  ''
).trim();
const groqModel = (process.env.GROQ_MODEL || (configuredProvider === 'groq' ? process.env.AI_MODEL : '') || 'openai/gpt-oss-120b').trim();

// Resolve Gemini specific configurations
const geminiApiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || (configuredProvider === 'gemini' ? process.env.AI_API_KEY : '') || '').trim();
const geminiModel = (process.env.AI_MODEL || 'gemini-3.8-flash').trim();

// Generic API key fallback based on active provider
const resolvedApiKey =
  configuredProvider === 'groq'
    ? groqApiKey
    : configuredProvider === 'gemini'
    ? geminiApiKey
    : (process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '');

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: (process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/aara_assistant').trim(),
  aiProvider: configuredProvider,
  groqApiKey,
  groqModel,
  geminiApiKey,
  geminiModel,
  aiApiKey: resolvedApiKey.trim(),
  aiBaseUrl: process.env.AI_BASE_URL || '',
  aiModel: configuredProvider === 'groq' ? groqModel : geminiModel,
  isProduction: process.env.NODE_ENV === 'production',
  envFilePath: loadedPath
};

export default config;
