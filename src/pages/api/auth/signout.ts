export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/db';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Log out from Supabase Auth
    await supabase.auth.signOut();

    // Remove token cookies
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });

    return new Response(JSON.stringify({ message: 'Logged out successfully!' }), {
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
export const GET = POST; // Allow simple GET request redirects to signout as well
