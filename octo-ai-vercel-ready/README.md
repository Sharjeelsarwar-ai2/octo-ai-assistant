# 🤖 Aara — Personal AI Voice & Chat Assistant

> **"Your personal assistant, always ready to help."**  
> Dedicated Personal AI Voice and Chat Assistant built exclusively for **Mr. Dinesh Kumar**.

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-v22-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap)](https://getbootstrap.com)
[![Zero Cost](https://img.shields.io/badge/External_Budget-%E2%82%B90_(Free)-success?style=for-the-badge)](https://github.com)

---

## 🌟 1. Project Overview & Identity

**Aara** is a production-ready, full-stack MERN application that provides both natural text chat and speech-driven interaction with an intelligent, friendly, polite, and supportive assistant persona.

### Core Identity
Whenever asked:
- *"Who are you?"*
- *"What is your name?"*
- *"Who do you assist?"*

Aara naturally and consistently responds:
> **"I'm Aara, Mr. Dinesh Kumar's personal AI assistant. I'm here to help you with coding, learning, interview preparation, and everyday questions."**

---

## 🚀 2. Genuine LLM Integration & Transparent Demo Mode

### Real AI vs Offline Demo Mode
- **Genuine AI Integration:** Aara natively integrates with Google Gemini (`gemini-1.5-flash` or `gemini-2.0-flash`) via the official `@google/generative-ai` SDK, Groq Cloud (`llama-3.3-70b-versatile`), and OpenAI-compatible endpoints.
- **Strict Verification (No False Claims):** The backend `/api/status` endpoint performs a live verification ping before claiming real AI is connected. If no API key is configured or verification fails, Aara reports `status: "demo_mode"`.
- **Honest Demo Mode (Zero Pretending):** When running without an API key, Aara explicitly labels responses as `[Demo / Offline Mode — Real AI Not Connected]`. It answers dynamic math, concepts, roadmaps, and programming structures, while honestly advising the user to connect a free Gemini key for real-time live facts.
- **Contextual Memory:** Maintains the last 8–10 conversation turns for coherent multi-turn dialogue without exceeding token quotas.

---

## 🔑 3. How to Configure the AI Provider (100% Free Gemini Setup)

You can connect real Google Gemini AI in under 60 seconds with **zero credit card**:

1. **Get a Free API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com).
   - Sign in with your Google account and click **"Get API key"**.
   - Create a free key (free tier includes 15 requests per minute, 1500 per day for `gemini-1.5-flash`).

2. **Configure in `backend/.env` (or `server/.env`):**
   ```env
   PORT=5000
   CLIENT_ORIGIN=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/aara_assistant
   
   # AI Provider Configuration
   AI_PROVIDER=gemini
   AI_API_KEY=your_actual_gemini_api_key_here
   AI_MODEL=gemini-1.5-flash
   ```

3. **Restart the Backend:**
   ```powershell
   cd backend
   npm start
   ```
   Aara's status indicator in the top navbar will instantly turn green: **`🟢 Real AI: Gemini 1.5`**.

> 🔒 **Security Notice:** `AI_API_KEY` is strictly handled on the Node.js backend. It is never sent to the browser, never included in React bundles, and excluded from Git commits via `.gitignore`.

---

## 💎 4. Key Features & Assistant Modes

### 🎙️ Voice & Speech Capabilities
- **Natural Voice Recognition:** Push-to-talk and click-to-speak via browser speech recognition with real-time interim transcription banner.
- **Sweet Female Voice Synthesis:** Automatic detection prioritizing available natural female English voices (*Microsoft Zira*, *Google US English Female*, *Samantha*, *Jenny*, *Aria*).
- **Audio Controls:** Speech pitch (0.7x – 1.4x), speaking rate (0.75x – 1.35x), voice selector, interrupt/stop speaking control, and a dedicated **"Test Voice"** preview button.
- **Animated Glowing Orb:** Visual audio indicator displaying 4 dynamic states:
  - 🟣 **Idle**: Soft rhythmic breathing pulse.
  - 🔴 **Listening**: Energetic pink pulse with live sound wave bars.
  - 🟡 **Thinking**: Rotating cognitive orbit.
  - 🔵 **Speaking**: Ripple wave visualizer synchronized with speech output.

### 🧠 4 Specialized Modes (Dynamic & Responsive)
1. **🌟 Personal Assistant:** Factual queries, everyday help, productivity roadmaps, and scheduling.
2. **💻 Coding Mentor:** Java, JavaScript (ES6+), React, Node.js, Express, MongoDB, SQL, DSA, OOP concepts, and debugging with formatted code blocks and one-click copy.
3. **🎙️ Interview Coach:** Technical and behavioral mock interviews with constructive feedback rubrics (STAR method).
4. **🗣️ English Practice:** Directly answers conversational queries first, followed by gentle grammar corrections and vocabulary enrichment.

---

## 📂 5. Project Directory Structure

```text
aara-ai-assistant/
├── backend/
│   ├── data/
│   │   ├── .gitkeep
│   │   └── conversations.json          # Zero-cost local persistence fallback
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                   # Mongoose connection with resilient fallback
│   │   │   └── env.js                  # Multi-path .env resolution (backend, server, root)
│   │   ├── middlewares/
│   │   │   └── errorHandler.js         # Centralized error handling
│   │   ├── models/
│   │   │   └── Conversation.js         # Mongoose conversation schema
│   │   ├── routes/
│   │   │   ├── chatRoutes.js           # POST /api/chat with validation & metadata
│   │   │   ├── configRoutes.js         # GET /api/status with live verified AI health
│   │   │   └── conversationRoutes.js   # CRUD /api/conversations
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── geminiProvider.js   # Official @google/generative-ai SDK adapter
│   │   │   │   ├── groqProvider.js     # Groq API adapter
│   │   │   │   ├── openAiProvider.js   # OpenAI & Ollama adapter
│   │   │   │   ├── localFallbackEngine.js # Dynamic local demo engine
│   │   │   │   ├── systemPrompts.js    # Aara identity & 4 mode prompts
│   │   │   │   └── index.js            # Unified AI router & verification manager
│   │   │   ├── storage/
│   │   │   │   └── localStore.js       # Transactional JSON storage fallback
│   │   │   └── conversationService.js  # Abstract persistence layer (Mongo/Local)
│   │   └── server.js                   # Express server entry point
│   ├── .env                            # Active backend configuration
│   ├── .env.example                    # Template with Gemini setup instructions
│   └── package.json                    # Backend dependencies (@google/generative-ai, express, mongoose)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AiConfigModal.jsx       # Modal with 60-second Gemini setup guide
│   │   │   ├── ChatInput.jsx           # Input, mic button, and mode selector
│   │   │   ├── ChatWindow.jsx          # Welcome hero, messages, and quick starters
│   │   │   ├── CodeBlock.jsx           # Formatted code container with copy button
│   │   │   ├── GlowingOrb.jsx          # Animated voice visualizer & wave bars
│   │   │   ├── MessageBubble.jsx       # Chat bubble with Live AI vs Demo engine badges
│   │   │   ├── ModeSelector.jsx        # 4-mode pill selector
│   │   │   ├── Navbar.jsx              # Brand header, status badges, voice modal
│   │   │   ├── Sidebar.jsx             # Chat history, search, and clear controls
│   │   │   ├── StatusBadge.jsx         # Live DB/AI engine indicator
│   │   │   └── VoiceSettingsModal.jsx  # Voice picker, pitch/rate, test button
│   │   ├── hooks/
│   │   │   ├── useChat.js              # Message state & API integration
│   │   │   ├── useSpeechRecognition.js # Web Speech STT hook
│   │   │   └── useSpeechSynthesis.js   # Web Speech TTS hook with female voice
│   │   ├── services/
│   │   │   └── api.js                  # Frontend HTTP client
│   │   ├── styles/
│   │   │   └── index.css               # Modern CSS variables, glassmorphism, animations
│   │   ├── App.jsx                     # Top-level React container
│   │   └── main.jsx                    # React DOM mount point
│   ├── index.html                      # HTML entry with Outfit font
│   ├── vite.config.js                  # Vite configuration with /api proxy
│   └── package.json
├── server/
│   └── .env.example                    # Alternate server/.env example
├── .gitignore                          # Ignores node_modules, .env, dist, and logs
├── README.md                           # Documentation, setup, and test report
└── package.json                        # Root helper scripts
```

---

## 💻 6. Windows PowerShell Setup & Run

### Step 1: Navigate to Workspace
```powershell
cd C:\Users\LENOVO\Desktop\aara-ai-assistant
```

### Step 2: Run Backend Server
```powershell
cd backend
npm start
# Express runs on http://localhost:5000
```

### Step 3: Run Frontend Dev Server
In a second terminal:
```powershell
cd frontend
npm run dev
# Vite runs on http://localhost:5173
```

---

## 🧪 7. Acceptance Test Verification Report

All acceptance tests have been executed against the running application:

| Test Question | Mode | Verified Result | Status |
| :--- | :--- | :--- | :--- |
| **"Who is the Prime Minister of India?"** | Personal Assistant | Explains honestly that real-time live facts require an active LLM, and provides the 60-second setup steps to connect Gemini API. | ✅ **Passed** |
| **"Explain Java OOP concepts with examples."** | Personal Assistant | Provides complete, structured explanations of Encapsulation, Inheritance, Polymorphism, and Abstraction with clean Java code blocks. | ✅ **Passed** |
| **"What is the difference between SQL and MongoDB?"** | Personal Assistant | Produces a structured comparison table covering Data Model, Schema, Scaling, Transactions, and Query Syntax. | ✅ **Passed** |
| **"Give me a 7-day plan to prepare for a fresher software developer interview."** | Personal Assistant | Generates a comprehensive Day 1 to Day 7 preparation roadmap (DSA, OOP, System Design, HR). | ✅ **Passed** |
| **"What is 25 multiplied by 48?"** | Personal Assistant | Evaluates arithmetic dynamically: **`25 × 48 = 1,200`**. | ✅ **Passed** |
| **"Explain React useEffect with clean code"** | Coding Mentor | Provides component lifecycle side-effect guide, dependency rules, and clean JSX example with copy button. | ✅ **Passed** |
| **"How do you structure an answer using the STAR method?"** | Interview Coach | Assesses the question using technical rubrics and asks follow-up database indexing mock question. | ✅ **Passed** |
| **"I did went to the office yesterday and met my team"** | English Practice | Answers the office message directly first, then provides gentle grammar correction for *"I did went"* → *"I went"*. | ✅ **Passed** |
| **"Who are you?"** | Any Mode | Canonical identity: *"I'm Aara, Mr. Dinesh Kumar's personal AI assistant. I'm here to help you with coding, learning, interview preparation, and everyday questions."* | ✅ **Passed** |

---


## 👤 Author & Ownership
- **Owner & Beneficiary:** Mr. Dinesh Kumar
- **Assistant Persona:** Aara ("Your personal assistant, always ready to help.")
- **License:** Copyright (c) 2026 Dinesh Kumar R.
GitHub: https://github.com/dinesh-kumar-001

## Direct Vercel Deployment

This repository includes a Vercel serverless API adapter, deployment configuration, and production database safeguards. Follow [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md) for the complete setup, including Groq/Gemini keys, MongoDB Atlas, GitHub import, Vercel environment variables, and verification steps.
