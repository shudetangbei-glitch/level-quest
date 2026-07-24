import { getDb } from "./db";
import { leaderboard, userProgress, levels } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Update leaderboard when a user completes a level
 */
export async function updateLeaderboard(
  userId: number,
  levelId: number,
  bestTime: number,
  userName: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Upsert into leaderboard
    await db
      .insert(leaderboard)
      .values({
        levelId,
        userId,
        bestTime,
        userName,
      })
      .onDuplicateKeyUpdate({
        set: {
          bestTime: sql`LEAST(bestTime, ${bestTime})`,
          userName,
        },
      });

    // Update ranks for this level
    await updateRanksForLevel(levelId);
  } catch (error) {
    console.error("[Leaderboard] Failed to update:", error);
  }
}

/**
 * Update ranks for a specific level
 */
export async function updateRanksForLevel(levelId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Get all entries for this level sorted by time
    const entries = await db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.levelId, levelId))
      .orderBy(leaderboard.bestTime);

    // Update ranks
    for (let i = 0; i < entries.length; i++) {
      await db
        .update(leaderboard)
        .set({ rank: i + 1 })
        .where(eq(leaderboard.id, entries[i].id));
    }
  } catch (error) {
    console.error("[Leaderboard] Failed to update ranks:", error);
  }
}

/**
 * Get leaderboard for a level with user details
 */
export async function getLeaderboardWithDetails(
  levelId: number,
  limit = 10
) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select({
        id: leaderboard.id,
        levelId: leaderboard.levelId,
        userId: leaderboard.userId,
        bestTime: leaderboard.bestTime,
        userName: leaderboard.userName,
        rank: leaderboard.rank,
      })
      .from(leaderboard)
      .where(eq(leaderboard.levelId, levelId))
      .orderBy(leaderboard.bestTime)
      .limit(limit);
  } catch (error) {
    console.error("[Leaderboard] Failed to fetch:", error);
    return [];
  }
}
