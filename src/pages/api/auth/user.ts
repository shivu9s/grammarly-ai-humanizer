export const prerender = false;

import type { APIRoute } from 'astro';
import { getAuthenticatedUser } from '../../../lib/db';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const user = await getAuthenticatedUser(cookies);
    if (!user) {
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
      wordLimit: user.isPremium ? 2000 : 500
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
