export const prerender = false;

import type { APIRoute } from 'astro';
import { getAuthenticatedUser, updateUserPremium } from '../../../lib/db';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const user = await getAuthenticatedUser(cookies);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Please sign in first.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Upgrade user premium field in Supabase profiles
    const updatedUser = await updateUserPremium(user.id, true);

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
