import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DB_PATH = path.resolve(process.cwd(), 'db.json');

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  isPremium: boolean;
  humanizeTimestamps: number[];
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: number;
}

interface DatabaseSchema {
  users: User[];
  sessions: Session[];
}

// Simple serial queue to prevent concurrent write race conditions
class WriteQueue {
  private queue: Promise<any> = Promise.resolve();

  enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.queue.then(operation);
    this.queue = next.catch(() => {});
    return next;
  }
}

const queue = new WriteQueue();

async function readDb(): Promise<DatabaseSchema> {
  try {
    const content = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // If file doesn't exist, return empty structure
    return { users: [], sessions: [] };
  }
}

async function writeDb(data: DatabaseSchema): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Users API
export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = await readDb();
  return db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

export async function getUserById(id: string): Promise<User | undefined> {
  const db = await readDb();
  return db.users.find(u => u.id === id);
}

export async function createUser(username: string, passwordHash: string): Promise<User> {
  return queue.enqueue(async () => {
    const db = await readDb();
    
    // Double check if username exists inside queue
    const exists = db.users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      throw new Error('Username already exists');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      passwordHash,
      isPremium: false,
      humanizeTimestamps: []
    };

    db.users.push(newUser);
    await writeDb(db);
    return newUser;
  });
}

export async function updateUserPremium(userId: string, isPremium: boolean): Promise<User> {
  return queue.enqueue(async () => {
    const db = await readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    db.users[userIndex].isPremium = isPremium;
    await writeDb(db);
    return db.users[userIndex];
  });
}

// Track/check humanizations
export async function trackUserHumanization(userId: string): Promise<{ allowed: boolean; remaining: number; maxLimit: number }> {
  return queue.enqueue(async () => {
    const db = await readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const user = db.users[userIndex];
    const maxLimit = user.isPremium ? 100 : 10;
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Filter out old timestamps (> 24 hours)
    user.humanizeTimestamps = (user.humanizeTimestamps || []).filter(t => t > oneDayAgo);

    if (user.humanizeTimestamps.length >= maxLimit) {
      // Limit exceeded
      await writeDb(db); // Save the cleaned up timestamps list anyway
      return { allowed: false, remaining: 0, maxLimit };
    }

    // Add new timestamp
    user.humanizeTimestamps.push(now);
    await writeDb(db);

    return {
      allowed: true,
      remaining: maxLimit - user.humanizeTimestamps.length,
      maxLimit
    };
  });
}

export async function getUserRemainingHumanizations(userId: string): Promise<{ count: number; maxLimit: number }> {
  const db = await readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return { count: 0, maxLimit: 10 };
  }

  const maxLimit = user.isPremium ? 100 : 10;
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const activeTimestamps = (user.humanizeTimestamps || []).filter(t => t > oneDayAgo);

  return {
    count: activeTimestamps.length,
    maxLimit
  };
}

// Sessions
export async function createSession(userId: string): Promise<Session> {
  return queue.enqueue(async () => {
    const db = await readDb();
    
    // Expire in 7 days
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const newSession: Session = {
      id: crypto.randomBytes(32).toString('hex'),
      userId,
      expiresAt
    };

    db.sessions.push(newSession);
    await writeDb(db);
    return newSession;
  });
}

export async function getSession(sessionId: string): Promise<Session | undefined> {
  const db = await readDb();
  const session = db.sessions.find(s => s.id === sessionId);
  
  if (session && session.expiresAt < Date.now()) {
    // Session has expired, clean it up asynchronously
    await destroySession(sessionId);
    return undefined;
  }
  
  return session;
}

export async function destroySession(sessionId: string): Promise<void> {
  return queue.enqueue(async () => {
    const db = await readDb();
    db.sessions = db.sessions.filter(s => s.id !== sessionId);
    await writeDb(db);
  });
}
