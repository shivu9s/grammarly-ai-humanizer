export const prerender = false;

import type { APIRoute } from 'astro';
import { destroySession } from '../../../lib/db';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const sessionId = cookies.get('session_id')?.value;
    if (sessionId) {
      await destroySession(sessionId);
      cookies.delete('session_id', { path: '/' });
    }

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
export const GET = POST; // Allow simple links to signout as well
