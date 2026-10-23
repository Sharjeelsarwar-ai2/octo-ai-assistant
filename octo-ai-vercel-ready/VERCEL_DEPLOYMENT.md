# OCTO AI: direct Vercel deployment

This project is configured as one Vercel project: Vite serves the React frontend and a Vercel Node.js serverless function handles `/api/*`. Conversation history uses MongoDB Atlas in production; production API requests intentionally fail with HTTP 503 if MongoDB cannot be reached rather than writing to Vercel's temporary filesystem.

## Before you begin

You need accounts for GitHub, Vercel, MongoDB Atlas, and one AI provider. Groq is the default provider in this guide. Keep both the Groq key and MongoDB connection string private; put them only in Vercel's server-side environment settings. Never prefix either secret with `VITE_`.

## 1. Put the project on GitHub

1. Download and extract the project folder.
2. Create a new private GitHub repository (recommended for a personal assistant).
3. Upload/commit the **contents** of this project folder, including `api/`, `backend/`, `frontend/`, `package.json`, and `vercel.json`. Do not nest all of the project one directory deeper than the repository root.
4. Confirm `.gitignore` is present before adding files. It excludes `.env`, dependencies, generated output, and local conversation data.
5. Do not upload a real `.env` file or API key. The safe template is `backend/.env.example`.

## 2. Create a Groq API key

1. Sign in at [Groq Console](https://console.groq.com/).
2. Open the API keys area (commonly `https://console.groq.com/keys`) and create a key.
3. Copy it once and store it in a password manager. Treat it like a password; do not paste it into source code, GitHub, chat, or a `VITE_` variable.
4. The code defaults to `GROQ_MODEL=openai/gpt-oss-120b`. If that model is not enabled for your Groq account, choose an available chat-completions model in your Groq Console and set that exact model ID as `GROQ_MODEL` in Vercel.

To use Gemini instead, create a key at [Google AI Studio](https://aistudio.google.com/app/apikey). In Vercel set `AI_PROVIDER=gemini`, `GEMINI_API_KEY` to the secret, and `AI_MODEL` to a model ID available to your account. Do not configure both providers unless you deliberately intend to switch between them; `AI_PROVIDER` selects the provider.

## 3. Create MongoDB Atlas storage

1. Sign in or create an account at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a cluster, then create a database user with a strong password. This is the database user, not necessarily your Atlas website login.
3. In Atlas **Network Access**, authorize connections from the Vercel function. Vercel functions generally do not have a single fixed outbound IP on standard plans. Atlas deployments commonly use `0.0.0.0/0` when there is no static egress IP; this allows connections from any IP, so use a unique strong database password, grant the user only the permissions the app needs, and use a static egress/private networking option if available to you.
4. In Atlas, choose **Connect → Drivers** and copy the Node.js connection string. Replace the username/password placeholders, URL-encode any special characters in the password, and use a database name such as `octo_ai_assistant`. It should look similar to:

   ```text
   mongodb+srv://DB_USER:URL_ENCODED_PASSWORD@cluster-name.example.mongodb.net/octo_ai_assistant?retryWrites=true&w=majority
   ```

5. Keep the connection string private. Do not commit it.

## 4. Import the repository into Vercel

1. Sign in at [Vercel](https://vercel.com/) and choose **Add New → Project**.
2. Connect GitHub if asked, then import the repository containing this project.
3. Keep the **Root Directory** at the repository root (the directory that contains `vercel.json`). Do **not** select `frontend` as the Root Directory; that would leave the API function out of the deployment.
4. If Vercel asks for a framework, choose Vite or leave its detection. The checked-in `vercel.json` provides the root install/build/output commands.
5. Before the first deployment, open **Environment Variables** and add the following values:

   | Name | Value |
   | --- | --- |
   | `MONGODB_URI` | Your full private Atlas connection string |
   | `AI_PROVIDER` | `groq` |
   | `GROQ_API_KEY` | Your private Groq API key |
   | `GROQ_MODEL` | `openai/gpt-oss-120b` (or an available model ID from your Groq account) |

   Add them for **Production** and also **Preview** if you want Git branch previews to work. For local Vercel CLI testing, also select **Development** or create a local `.env` file that is never committed. Do not add `VITE_API_BASE_URL`: the frontend uses same-origin `/api` by default, so the browser never needs the secret or a separate backend URL.

6. Click **Deploy**. The root scripts install backend and frontend lockfile dependencies and build `frontend/dist`; `api/[...path].js` exposes the Express routes as a serverless function.

## 5. Verify the live deployment

Replace `YOUR-APP.vercel.app` below with your assigned hostname.

1. Open `https://YOUR-APP.vercel.app/` and confirm the interface loads.
2. Open `https://YOUR-APP.vercel.app/api/status`. You should get JSON. Check that `database.connected` is `true`, and that the AI status reports the provider you configured. The status endpoint sends a small live verification request to the chosen AI provider; it may consume provider usage.
3. Send a chat prompt in the app. Confirm that you get a real provider response.
4. Refresh the page and confirm the conversation appears in history. This tests durable MongoDB storage, not just a successful model call.
5. In Vercel, inspect **Deployment → Functions/Logs** if an endpoint fails. Also review Atlas Network Access and the exact spelling/value of Vercel environment variables. After editing an environment variable, redeploy so the function and frontend build receive the new values.

## 6. Local test before/after deployment (optional)

Use Node.js 18 or newer. From the repository root:

```bash
npm run setup
cp backend/.env.example backend/.env
```

Edit `backend/.env` with a real `MONGODB_URI`, `AI_PROVIDER=groq`, and `GROQ_API_KEY`. Never commit this file. In terminal 1 run:

```bash
npm run dev:backend
```

In terminal 2 run:

```bash
npm run dev:frontend
```

Open the Vite URL shown in terminal 2 (normally `http://localhost:5173`). The Vite `/api` proxy forwards calls to the local backend. To run the same Vercel routing locally, install the Vercel CLI and use `vercel dev` from the repository root after setting local environment variables.

## Troubleshooting

- **`/api/status` returns 503 / persistent database unavailable:** Check `MONGODB_URI`, the database username and password, percent-encoding of password characters, Atlas user permissions, and Atlas Network Access. Production intentionally refuses the non-persistent JSON fallback.
- **Groq reports a 401:** Create a new key in Groq Console and replace `GROQ_API_KEY` in Vercel. Redeploy; never put the key in frontend code.
- **Groq returns 404 or model not found:** Set `GROQ_MODEL` to a model ID available to your account. Redeploy and retest `/api/status`.
- **AI status says demo mode:** Confirm `AI_PROVIDER=groq` and `GROQ_API_KEY` are set in the environment corresponding to the deployment (Production vs Preview), then redeploy.
- **Local API works but deployed `/api` returns 404:** Confirm Vercel Root Directory is the repository root, `api/[...path].js` is committed, and the root `vercel.json` is deployed.
- **Frontend loads but cannot reach API:** Keep the root Vercel project configuration. Do not set an external `VITE_API_BASE_URL`; use `/api` on the same Vercel hostname.
- **The function times out:** Check Vercel function logs and provider latency/limits. Serverless execution limits vary by Vercel plan; do not assume a long-running Express process or unlimited request duration.

## What this deploy does and does not do

The Vercel function has no persistent local filesystem and must not be relied upon to save chat history. MongoDB Atlas provides durable history. The function can sleep between requests and is started on demand; this is normal serverless behavior. Browser voice recognition and speech synthesis depend on browser support and user permissions. Provider quotas, current model availability, and Vercel execution limits depend on your accounts and change over time.
