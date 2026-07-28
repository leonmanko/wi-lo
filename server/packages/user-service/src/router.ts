import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const userRouter = t.router({
  getProfile: t.procedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      return {
        userId: input.userId,
        name: "Placeholder",
        email: "placeholder@wi-lo.app",
        bio: null,
        avatarUrl: null,
        level: 1,
        xp: 0,
        totalCoins: 0,
        totalDiamonds: 0,
        favoriteSport: null,
        favoriteTeam: null,
      };
    }),

  updateProfile: t.procedure
    .input(z.object({
      userId: z.string().uuid(),
      name: z.string().min(2).optional(),
      bio: z.string().max(500).optional(),
      favoriteSport: z.string().optional(),
      favoriteTeam: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, ...input };
    }),

  getStats: t.procedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      return {
        userId: input.userId,
        totalQuizzes: 0,
        totalWins: 0,
        winRate: 0,
        bestStreak: 0,
        totalCoinsEarned: 0,
      };
    }),

  searchUsers: t.procedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ input }) => {
      return [{ id: "placeholder", name: input.query, email: "placeholder@wi-lo.app" }];
    }),

  requestDataDeletion: t.procedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return { success: true, message: `Data deletion requested for ${input.userId}` };
    }),
});

export type UserRouter = typeof userRouter;