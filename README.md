# ✨ Grammarly AI Humanizer

A professional, undetectable AI-to-human text humanizer tool built with **Astro 7**, **Tailwind CSS**, and deployed on **Cloudflare Workers**. 

This application transforms AI-generated content (from ChatGPT, Gemini, Claude, etc.) into natural, human-like writing that easily bypasses major AI detectors (such as Turnitin, GPTZero, and Copyleaks) while preserving the original meaning.

🌐 **Live URL:** [https://grammarly-ai-humanizer.oniic.workers.dev](https://grammarly-ai-humanizer.oniic.workers.dev)

---

## 🚀 Key Features

*   **Undetectable Outputs:** Fine-tuned LLM prompting that mimics natural human sentence structures, active voice, and realistic vocabulary variation.
*   **Dual Engine Support:** Supports both **Gemini** (Google) and **Groq** (Llama-3) translation and rewriting models.
*   **Modern Premium UI:** A beautifully designed interface with glassmorphism, responsive layout, fluid micro-animations, and live conversion statistics.
*   **Real-time Metrics:** Displays character count, word count, readability levels, and estimated AI detection probability.
*   **Secure Sessions:** Secure KV-based session storage managed natively via Cloudflare Workers.

---

## 🛠️ Tech Stack

*   **Framework:** [Astro](https://astro.build) (Server-Side Rendered mode)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
*   **Hosting/Platform:** [Cloudflare Workers & Assets](https://workers.cloudflare.com)
*   **Storage:** [Cloudflare KV Namespace](https://developers.cloudflare.com/kv/) (for user session state)
*   **Database:** [Supabase](https://supabase.com) (for translation history and user logs)

---

## ⚙️ Local Development

### 1. Prerequisites
Ensure you have Node.js installed on your machine.

### 2. Setup
Clone the repository and install dependencies:
```bash
git clone https://github.com/shivu9s/grammarly-ai-humanizer.git
cd grammarly-ai-humanizer
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Database Credentials
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# LLM Providers Keys
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### 4. Running the Dev Server
Run the local dev server using the background configuration:
```bash
astro dev --background
```

---

## 🚢 Production Deployment

This project uses Cloudflare Workers for lightning-fast edge rendering and asset delivery.

### 1. Build and Deploy
To build the static assets, compile the edge server worker, and deploy:
```bash
npm run deploy
```

### 2. Configure Cloudflare Secrets
Set your API keys and Supabase credentials in the Cloudflare environment:
```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GROQ_API_KEY
```

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
