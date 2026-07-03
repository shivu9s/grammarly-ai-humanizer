export const prerender = false;

import type { APIRoute } from 'astro';
import { getSession, updateUserPremium } from '../../../lib/db';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const sessionId = cookies.get('session_id')?.value;
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Please sign in first.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Session expired. Please sign in again.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Set user as premium
    const updatedUser = await updateUserPremium(session.userId, true);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully upgraded ${updatedUser.username} to Premium!`,
      isPremium: true
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
