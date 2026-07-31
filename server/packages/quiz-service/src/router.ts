import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { db } from "../../../src/db";
import { sports } from "../../../src/db/schema/sports";
import { categories } from "../../../src/db/schema/categories";
import { questions } from "../../../src/db/schema/questions";
import { answers } from "../../../src/db/schema/answers";
import { eq } from "drizzle-orm";

const t = initTRPC.create();

export const quizRouter = t.router({
  getSports: t.procedure.query(async () => {
    return db.select().from(sports);
  }),

  getCategories: t.procedure
    .input(z.object({ sportId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db.select().from(categories).where(eq(categories.sportId, input.sportId));
    }),

  getQuestions: t.procedure
    .input(z.object({
      categoryId: z.string().uuid().optional(),
      difficultyLevel: z.number().min(1).max(3).optional(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      return db.select().from(questions).limit(input.limit);
    }),

  getQuestionById: t.procedure
    .input(z.object({ questionId: z.string().uuid() }))
    .query(async ({ input }) => {
      const question = await db.select().from(questions).where(eq(questions.id, input.questionId)).limit(1);
      const questionAnswers = await db.select().from(answers).where(eq(answers.questionId, input.questionId));
      return { ...question[0], answers: questionAnswers };
    }),
});

export type QuizRouter = typeof quizRouter;