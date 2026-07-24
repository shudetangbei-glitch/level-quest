import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, levels, userProgress, leaderboard, userStats } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getLevels() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(levels).orderBy(levels.levelNumber);
}

export async function getLevel(levelId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(levels).where(eq(levels.id, levelId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userProgress).where(eq(userProgress.userId, userId));
}

export async function getUserProgressForLevel(userId: number, levelId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(userProgress)
    .where((up) => sql`${up.userId} = ${userId} AND ${up.levelId} = ${levelId}`)
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserProgress(
  userId: number,
  levelId: number,
  data: {
    isUnlocked?: boolean;
    isCompleted?: boolean;
    bestTime?: number;
    stars?: number;
    attempts?: number;
  }
) {
  const db = await getDb();
  if (!db) return;

  const updateSet: Record<string, unknown> = {};
  if (data.isUnlocked !== undefined) updateSet.isUnlocked = data.isUnlocked ? 1 : 0;
  if (data.isCompleted !== undefined) updateSet.isCompleted = data.isCompleted ? 1 : 0;
  if (data.bestTime !== undefined) updateSet.bestTime = data.bestTime;
  if (data.stars !== undefined) updateSet.stars = data.stars;
  if (data.attempts !== undefined) updateSet.attempts = data.attempts;

  await db
    .insert(userProgress)
    .values({
      userId,
      levelId,
      isUnlocked: data.isUnlocked ? 1 : 0,
      isCompleted: data.isCompleted ? 1 : 0,
      bestTime: data.bestTime,
      stars: data.stars,
      attempts: data.attempts,
    })
    .onDuplicateKeyUpdate({
      set: updateSet,
    });
}

export async function getLeaderboard(levelId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(leaderboard)
    .where(eq(leaderboard.levelId, levelId))
    .orderBy(leaderboard.bestTime)
    .limit(limit);
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserStats(
  userId: number,
  data: {
    totalScore?: number;
    totalStars?: number;
    completedLevels?: number;
  }
) {
  const db = await getDb();
  if (!db) return;

  const updateSet: Record<string, unknown> = {};
  if (data.totalScore !== undefined) updateSet.totalScore = data.totalScore;
  if (data.totalStars !== undefined) updateSet.totalStars = data.totalStars;
  if (data.completedLevels !== undefined) updateSet.completedLevels = data.completedLevels;

  await db
    .insert(userStats)
    .values({
      userId,
      totalScore: data.totalScore || 0,
      totalStars: data.totalStars || 0,
      completedLevels: data.completedLevels || 0,
    })
    .onDuplicateKeyUpdate({
      set: updateSet,
    });
}

export async function getGlobalLeaderboard(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(userStats)
    .orderBy(userStats.totalStars, userStats.totalScore)
    .limit(limit);
}

// TODO: add feature queries here as your schema grows.
