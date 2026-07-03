export const prerender = false;

import type { APIRoute } from 'astro';
import { getSession, getUserById } from '../../../lib/db';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const sessionId = cookies.get('session_id')?.value;
    if (!sessionId) {
      return new Response(JSON.stringify({ loggedIn: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = await getSession(sessionId);
    if (!session) {
      // Clear invalid cookie
      cookies.delete('session_id', { path: '/' });
      return new Response(JSON.stringify({ loggedIn: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      cookies.delete('session_id', { path: '/' });
      return new Response(JSON.stringify({ loggedIn: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const maxLimit = user.isPremium ? 100 : 10;
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    // Filter active timestamps
    const activeTimestamps = (user.humanizeTimestamps || []).filter(t => t > oneDayAgo);
    const count = activeTimestamps.length;

    return new Response(JSON.stringify({
      loggedIn: true,
      username: user.username,
      isPremium: user.isPremium,
      used: count,
      limit: maxLimit,
      remaining: Math.max(0, maxLimit - count),
      wordLimit: user.isPremium ? 2000 : 300
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
