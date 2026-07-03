import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Clients
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

export interface User {
  id: string;
  username: string;
  passwordHash?: string; // Kept for compatibility, not stored for Supabase users
  isPremium: boolean;
  humanizeTimestamps: number[];
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: number;
}

// Utility to helper parse / convert usernames to virtual emails
export function normalizeUsernameToEmail(username: string): string {
  if (username.includes('@')) {
    return username.trim().toLowerCase();
  }
  return `${username.trim().toLowerCase()}@local.humanizer`;
}

// Kept for backward compatibility if needed, but not used by new Supabase Auth flow
export function hashPassword(password: string): string {
  return password; 
}

// Get the currently authenticated user from cookies, handling session refresh
export async function getAuthenticatedUser(cookies: any): Promise<User | null> {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken || !refreshToken) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (error || !data.user) {
      cookies.delete('sb-access-token', { path: '/' });
      cookies.delete('sb-refresh-token', { path: '/' });
      return null;
    }

    // If session was renewed (e.g. token refreshed), update the cookies
    if (data.session) {
      cookies.set('sb-access-token', data.session.access_token, {
        path: '/',
        httpOnly: true,
        secure: false, // allow localhost http testing
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax'
      });
      cookies.set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax'
      });
    }

    // Get the user profile from Supabase Database
    const profile = await getUserById(data.user.id);
    return profile || null;
  } catch (err) {
    return null;
  }
}

// Users API
export async function getUserByUsername(username: string): Promise<User | undefined> {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle();

  if (error || !profile) {
    return undefined;
  }

  return {
    id: profile.id,
    username: profile.username,
    isPremium: profile.is_premium,
    humanizeTimestamps: (profile.humanize_timestamps || []).map((t: any) => Number(t))
  };
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) {
    return undefined;
  }

  return {
    id: profile.id,
    username: profile.username,
    isPremium: profile.is_premium,
    humanizeTimestamps: (profile.humanize_timestamps || []).map((t: any) => Number(t))
  };
}

export async function createUser(id: string, username: string): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      id,
      username,
      is_premium: false,
      humanize_timestamps: []
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create user profile in database.');
  }

  return {
    id: data.id,
    username: data.username,
    isPremium: data.is_premium,
    humanizeTimestamps: (data.humanize_timestamps || []).map((t: any) => Number(t))
  };
}

export async function updateUserPremium(userId: string, isPremium: boolean): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ is_premium: isPremium })
    .eq('id', userId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to update premium status in database.');
  }

  return {
    id: data.id,
    username: data.username,
    isPremium: data.is_premium,
    humanizeTimestamps: (data.humanize_timestamps || []).map((t: any) => Number(t))
  };
}

// Track/check humanizations
export async function trackUserHumanization(userId: string): Promise<{ allowed: boolean; remaining: number; maxLimit: number }> {
  const profile = await getUserById(userId);
  if (!profile) {
    throw new Error('User profile not found.');
  }

  const maxLimit = profile.isPremium ? 100 : 10;
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // Filter out timestamps older than 24 hours
  const activeTimestamps = profile.humanizeTimestamps.filter(t => t > oneDayAgo);

  if (activeTimestamps.length >= maxLimit) {
    // Limit exceeded, save cleaned list anyway
    await supabaseAdmin
      .from('profiles')
      .update({ humanize_timestamps: activeTimestamps })
      .eq('id', userId);

    return { allowed: false, remaining: 0, maxLimit };
  }

  // Add new timestamp
  activeTimestamps.push(now);

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ humanize_timestamps: activeTimestamps })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message || 'Failed to track humanization usage.');
  }

  return {
    allowed: true,
    remaining: maxLimit - activeTimestamps.length,
    maxLimit
  };
}

export async function getUserRemainingHumanizations(userId: string): Promise<{ count: number; maxLimit: number }> {
  const profile = await getUserById(userId);
  if (!profile) {
    return { count: 0, maxLimit: 10 };
  }

  const maxLimit = profile.isPremium ? 100 : 10;
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const activeTimestamps = profile.humanizeTimestamps.filter(t => t > oneDayAgo);

  return {
    count: activeTimestamps.length,
    maxLimit
  };
}

// These session methods are kept for legacy compatibility but are handled in cookies directly via Supabase Auth
export async function createSession(userId: string): Promise<Session> {
  return {
    id: 'supabase-handled',
    userId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
}

export async function getSession(sessionId: string): Promise<Session | undefined> {
  return undefined;
}

export async function destroySession(sessionId: string): Promise<void> {
  return;
}
