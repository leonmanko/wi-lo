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

  createQuestion: t.procedure
    .input(z.object({
      categoryId: z.string().uuid(),
      questionText: z.string().min(10),
      difficultyLevel: z.number().min(1).max(3).default(1),
      sourceFactId: z.string().optional(),
      answers: z.array(z.object({
        answerText: z.string().min(1),
        isCorrect: z.boolean(),
        order: z.number(),
      })).min(4).max(4),
    }))
    .mutation(async ({ input }) => {
      const { answers: questionAnswers, ...questionData } = input;
      const [question] = await db.insert(questions).values(questionData).returning();
      if (!question) throw new Error("Failed to create question");
      await db.insert(answers).values(
        questionAnswers.map((a) => ({ ...a, questionId: question.id }))
      );
      return question;
    }),

  updateQuestion: t.procedure
    .input(z.object({
      questionId: z.string().uuid(),
      questionText: z.string().min(10).optional(),
      difficultyLevel: z.number().min(1).max(3).optional(),
      freshnessExpiresAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { questionId, ...updates } = input;
      await db.update(questions).set(updates).where(eq(questions.id, questionId));
      return { success: true };
    }),

  deleteQuestion: t.procedure
    .input(z.object({ questionId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db.delete(answers).where(eq(answers.questionId, input.questionId));
      await db.delete(questions).where(eq(questions.id, input.questionId));
      return { success: true };
    }),
});

export type QuizRouter = typeof quizRouter;