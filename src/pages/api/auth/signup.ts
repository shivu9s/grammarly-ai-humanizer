export const prerender = false;

import type { APIRoute } from 'astro';
import { getUserByUsername, createUser, hashPassword } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { username, password } = await request.json();

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return new Response(JSON.stringify({ error: 'Username must be at least 3 characters long.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters long.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Username is already taken.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const passwordHash = hashPassword(password);
    await createUser(username.trim(), passwordHash);

    return new Response(JSON.stringify({ message: 'User registered successfully!' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
