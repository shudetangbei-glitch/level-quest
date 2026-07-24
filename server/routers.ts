import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getLevels,
  getLevel,
  getUserProgress,
  getUserProgressForLevel,
  upsertUserProgress,
  upsertUserStats,
  getUserStats,
  getLeaderboard,
  getGlobalLeaderboard,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  game: router({
    // Get all levels
    getLevels: publicProcedure.query(async () => {
      return getLevels();
    }),

    // Get user's progress for all levels
    getUserProgress: protectedProcedure.query(async ({ ctx }) => {
      return getUserProgress(ctx.user.id);
    }),

    // Save level completion
    saveLevelCompletion: protectedProcedure
      .input((input: unknown) => {
        const data = input as {
          levelId: number;
          completionTime: number;
          stars: number;
        };
        return data;
      })
      .mutation(async ({ ctx, input }) => {
        const existingProgress = await getUserProgressForLevel(ctx.user.id, input.levelId);
        const isBetterTime =
          !existingProgress ||
          !existingProgress.bestTime ||
          input.completionTime < existingProgress.bestTime;

        if (isBetterTime) {
          await upsertUserProgress(ctx.user.id, input.levelId, {
            isCompleted: true,
            bestTime: input.completionTime,
            stars: input.stars,
            attempts: (existingProgress?.attempts || 0) + 1,
          });

          // Update user stats
          const stats = await getUserStats(ctx.user.id);
          const newStars = (stats?.totalStars || 0) + input.stars;
          const newCompleted =
            (stats?.completedLevels || 0) + (existingProgress?.isCompleted ? 0 : 1);

          await upsertUserStats(ctx.user.id, {
            totalStars: newStars,
            totalScore: newStars * 100,
            completedLevels: newCompleted,
          });
        }

        return { success: true, isBetterTime };
      }),

    // Get leaderboard for a level
    getLeaderboard: publicProcedure
      .input((input: unknown) => {
        const data = input as { levelId: number; limit?: number };
        return data;
      })
      .query(async ({ input }) => {
        return getLeaderboard(input.levelId, input.limit || 10);
      }),

    // Get global leaderboard
    getGlobalLeaderboard: publicProcedure
      .input((input: unknown) => {
        const data = input as { limit?: number };
        return data;
      })
      .query(async ({ input }) => {
        return getGlobalLeaderboard(input.limit || 10);
      }),

    // Unlock next level
    unlockNextLevel: protectedProcedure
      .input((input: unknown) => {
        const data = input as { currentLevelId: number };
        return data;
      })
      .mutation(async ({ ctx, input }) => {
        const currentLevel = await getLevel(input.currentLevelId);
        if (!currentLevel) return { success: false };

        const nextLevelNumber = currentLevel.levelNumber + 1;
        const allLevels = await getLevels();
        const nextLevel = allLevels.find((l) => l.levelNumber === nextLevelNumber);

        if (nextLevel) {
          await upsertUserProgress(ctx.user.id, nextLevel.id, {
            isUnlocked: true,
          });
        }

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
