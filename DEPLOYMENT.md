# Grammarly AI Humanizer - Deployment Manual

This guide describes how to deploy the **Grammarly AI Humanizer** website in production, manage environment variables, and verify configuration stability.

---

## 🔑 Required Environment Variables

The website relies on the following environment variables. They must be set in your production hosting panel or in a `.env` file:

| Variable Name | Type | Description |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Required | The URL of your Supabase project instance (e.g. `https://xxx.supabase.co`). |
| `SUPABASE_ANON_KEY` | Required | The anonymous client API key for your Supabase database. |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | The service role key for database admin commands (used on the server for tracking limits). |
| `GEMINI_API_KEY` | Optional* | Google Gemini API key. Recommended for primary humanization operations. |
| `GROQ_API_KEY` | Optional* | Groq API Key. Used as secondary/fallback humanizer provider. |

*\* Note: Either `GEMINI_API_KEY` or `GROQ_API_KEY` must be provided. The application will warn/fail if both are missing.*

---

## 🐳 Containerized Deployment (Recommended)

The project includes an optimized multi-stage `Dockerfile` and a `.dockerignore` file. This is ideal for VPS, **Railway**, **Render**, **Fly.io**, or cloud providers (AWS, GCP, DigitalOcean).

### 1. Build the Docker Image
To build the image locally:
```bash
docker build -t grammarly-ai-humanizer .
```

### 2. Run the Container
Start the container and supply the environment variables (e.g., matching your `.env` settings):
```bash
docker run -p 4321:4321 \
  -e SUPABASE_URL="https://your-instance.supabase.co" \
  -e SUPABASE_ANON_KEY="your-anon-key" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  -e GEMINI_API_KEY="your-gemini-key" \
  grammarly-ai-humanizer
```
The site will be running at `http://localhost:4321`.

---

## 🚀 Deploying to SaaS Hosting Platforms

### 1. Railway.app (Easiest for Docker)
Railway detects the `Dockerfile` automatically and runs the built server:
1. Create a new project on Railway and link your repository.
2. Under **Variables**, add all of the required variables listed in the table above.
3. Railway will build using the `Dockerfile` and expose the container port.

### 2. Render.com
1. Create a new **Web Service** on Render.
2. Link your Git repository.
3. Select Environment as **Docker**.
4. In the **Advanced** section, add your environment variables.
5. Render will build and deploy the container.

---

## ⚡ Serverless Deployments (Vercel & Netlify)

If you prefer to deploy to **Vercel** or **Netlify** instead of a standalone Node server, you can swap adapters:

### For Vercel:
1. Install the Vercel adapter:
   ```bash
   npm install @astrojs/vercel
   ```
2. Update `astro.config.mjs` to use the Vercel adapter:
   ```javascript
   import { defineConfig } from 'astro/config';
   import tailwindcss from '@tailwindcss/vite';
   import vercel from '@astrojs/vercel'; // [SWAP]

   export default defineConfig({
     adapter: vercel({
       webAnalytics: { enabled: true }
     }),
     // ...
   });
   ```

### For Netlify:
1. Install the Netlify adapter:
   ```bash
   npm install @astrojs/netlify
   ```
2. Update `astro.config.mjs` to use the Netlify adapter:
   ```javascript
   import { defineConfig } from 'astro/config';
   import tailwindcss from '@tailwindcss/vite';
   import netlify from '@astrojs/netlify'; // [SWAP]

   export default defineConfig({
     adapter: netlify(),
     // ...
   });
   ```

---

## 🛠️ Verification & Diagnostics

To run pre-flight checks locally or in CI/CD pipelines before code gets pushed, use these commands:

- **Typecheck & Astro Linting**:
  ```bash
  npm run typecheck
  ```
- **Local Production Build Test**:
  ```bash
  npm run build
  ```
- **Local Production Preview**:
  ```bash
  npm run preview
  ```
