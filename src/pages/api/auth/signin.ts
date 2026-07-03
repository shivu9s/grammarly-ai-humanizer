export const prerender = false;

import type { APIRoute } from 'astro';
import { getUserById, normalizeUsernameToEmail, supabase } from '../../../lib/db';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Please provide both username and password.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const email = normalizeUsernameToEmail(username);

    // Sign in using Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.session || !data.user) {
      return new Response(JSON.stringify({ error: error?.message || 'Invalid username or password.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Set cookie session parameters
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

    // Get user profile details
    const profile = await getUserById(data.user.id);
    const displayName = profile ? profile.username : username;
    const isPremium = profile ? profile.isPremium : false;

    return new Response(JSON.stringify({ 
      message: 'Logged in successfully!', 
      username: displayName, 
      isPremium 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
