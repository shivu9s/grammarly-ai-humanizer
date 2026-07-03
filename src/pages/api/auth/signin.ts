export const prerender = false;

import type { APIRoute } from 'astro';
import { getUserByUsername, hashPassword, createSession } from '../../../lib/db';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Please provide both username and password.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await getUserByUsername(username);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid username or password.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return new Response(JSON.stringify({ error: 'Invalid username or password.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create session
    const session = await createSession(user.id);

    // Set cookie
    cookies.set('session_id', session.id, {
      path: '/',
      httpOnly: true,
      secure: false, // allow local testing on localhost http
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax'
    });

    return new Response(JSON.stringify({ message: 'Logged in successfully!', username: user.username, isPremium: user.isPremium }), {
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
