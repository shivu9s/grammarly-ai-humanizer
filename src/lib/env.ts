/**
 * Environment Variable Validation
 * Ensures that critical environment variables are loaded and valid on startup/build.
 */

export interface EnvVariables {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
}

export function validateEnv(): EnvVariables {
  const isProd = import.meta.env.PROD || process.env.NODE_ENV === 'production';

  const SUPABASE_URL = (isProd ? (process.env.SUPABASE_URL || '') : (import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL || '')).trim();
  const SUPABASE_ANON_KEY = (isProd ? (process.env.SUPABASE_ANON_KEY || '') : (import.meta.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '')).trim();
  const SUPABASE_SERVICE_ROLE_KEY = (isProd ? (process.env.SUPABASE_SERVICE_ROLE_KEY || '') : (import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '')).trim();
  const GEMINI_API_KEY = (isProd ? (process.env.GEMINI_API_KEY || '') : (import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '')).trim();
  const GROQ_API_KEY = (isProd ? (process.env.GROQ_API_KEY || '') : (import.meta.env.GROQ_API_KEY || process.env.GROQ_API_KEY || '')).trim();

  const missing: string[] = [];

  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  const hasLLMKey = (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') || 
                      (GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here');

  if (!hasLLMKey) {
    missing.push('Either GEMINI_API_KEY or GROQ_API_KEY must be configured.');
  }

  if (missing.length > 0) {
    const errorMessage = `[Deployment Error] Missing environment configuration:\n- ${missing.join('\n- ')}\nPlease configure these in your deployment dashboard or local .env file.`;
    
    if (isProd) {
      console.error(errorMessage);
      throw new Error(errorMessage);
    } else {
      console.warn('⚠️ ' + errorMessage);
    }
  }

  return {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY,
    GROQ_API_KEY
  };
}

// Run validation immediately on import
export const env = validateEnv();
