import { initTRPC, TRPCError } from "@trpc/server";
import crypto from "crypto";
import { z } from "zod";
import { db } from "../../../src/db";
import { sports } from "../../../src/db/schema/sports";
import { categories } from "../../../src/db/schema/categories";
import { questions } from "../../../src/db/schema/questions";
import { answers } from "../../../src/db/schema/answers";
import { quizSessions } from "../../../src/db/schema/quiz_sessions";
import { quizSessionQuestions } from "../../../src/db/schema/quiz_session_questions";
import { quizAnswers } from "../../../src/db/schema/quiz_answers";
import { userQuestionHistory } from "../../../src/db/schema/user_question_history";
import { playerSkillService } from "../../../src/services/player-skill.service";
import { eq, and, sql, inArray } from "drizzle-orm";

// Admin tokens
const ADMIN_TOKENS = [process.env.ADMIN_API_KEY || "dev-admin-key"];

function requireAdmin(headers: { authorization?: string }) {
  const token = headers.authorization?.replace("Bearer ", "");
  if (!token || !ADMIN_TOKENS.includes(token)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
  }
}

// Contexte tRPC : on récupère le userId depuis un header personnalisé, 
// qui sera injecté par l'API Gateway après validation JWT.
const t = initTRPC.context<{ userId: string }>().create();

const authenticated = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next();
});

// Constantes métier
const COOLDOWN_DAYS = 90;
const DIFFICULTY_MAP: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

const startQuizSchema = z.object({
  sportId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  questionCount: z.number().int().min(1).max(50),
  adaptive: z.boolean().default(false),
});

// Stratégie de sélection avec jointure correcte (via catégories)
async function selectUnseenQuestions(
  sportId: string,
  categoryId: string | undefined,
  difficultyLevel: number,
  limit: number,
  userId: string,
) {
  const conditions = [
    eq(categories.sportId, sportId),
    eq(questions.difficultyLevel, difficultyLevel),
  ];
  if (categoryId) {
    conditions.push(eq(questions.categoryId, categoryId));
  }

  return db
    .select({ id: questions.id })
    .from(questions)
    .innerJoin(categories, eq(questions.categoryId, categories.id))
    .leftJoin(
      userQuestionHistory,
      and(
        eq(userQuestionHistory.questionId, questions.id),
        eq(userQuestionHistory.userId, userId)
      )
    )
    .where(and(...conditions, sql`${userQuestionHistory.id} IS NULL`))
    .limit(limit)
    .orderBy(sql`RANDOM()`);
}

async function selectUnseenFromSiblingCategories(
  sportId: string,
  excludeCategoryId: string | undefined,
  difficultyLevel: number,
  limit: number,
  userId: string,
) {
  const baseConditions = [
    eq(categories.sportId, sportId),
    eq(questions.difficultyLevel, difficultyLevel),
  ];
  if (excludeCategoryId) {
    baseConditions.push(sql`${questions.categoryId} IS DISTINCT FROM ${excludeCategoryId}`);
  }

  return db
    .select({ id: questions.id })
    .from(questions)
    .innerJoin(categories, eq(questions.categoryId, categories.id))
    .leftJoin(
      userQuestionHistory,
      and(
        eq(userQuestionHistory.questionId, questions.id),
        eq(userQuestionHistory.userId, userId)
      )
    )
    .where(and(...baseConditions, sql`${userQuestionHistory.id} IS NULL`))
    .limit(limit)
    .orderBy(sql`RANDOM()`);
}

async function selectOldestSeen(
  sportId: string,
  categoryId: string | undefined,
  difficultyLevel: number,
  limit: number,
  userId: string,
) {
  const cooldownDate = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  const conditions = [
    eq(categories.sportId, sportId),
    eq(questions.difficultyLevel, difficultyLevel),
    eq(userQuestionHistory.userId, userId),
    sql`${userQuestionHistory.lastShownAt} < ${cooldownDate}`,
  ];
  if (categoryId) {
    conditions.push(eq(questions.categoryId, categoryId));
  }

  return db
    .select({ id: questions.id })
    .from(questions)
    .innerJoin(categories, eq(questions.categoryId, categories.id))
    .innerJoin(userQuestionHistory, eq(questions.id, userQuestionHistory.questionId))
    .where(and(...conditions))
    .orderBy(sql`${userQuestionHistory.lastShownAt} ASC`)
    .limit(limit);
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Routeur ---
export const quizRouter = t.router({
  // Procédures existantes
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
      adminToken: z.string(),
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
      requireAdmin({ authorization: `Bearer ${input.adminToken}` });
      const { answers: questionAnswers, ...questionData } = input;
      const [question] = await db.insert(questions).values(questionData).returning();
      if (!question) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create question" });
      await db.insert(answers).values(
        questionAnswers.map((a) => ({ ...a, questionId: question.id }))
      );
      return question;
    }),

  updateQuestion: t.procedure
    .input(z.object({
      adminToken: z.string(),
      questionId: z.string().uuid(),
      questionText: z.string().min(10).optional(),
      difficultyLevel: z.number().min(1).max(3).optional(),
      freshnessExpiresAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      requireAdmin({ authorization: `Bearer ${input.adminToken}` });
      const { questionId, adminToken, freshnessExpiresAt, ...updates } = input;
      const updateData: any = { ...updates };
      if (freshnessExpiresAt) {
        updateData.freshnessExpiresAt = new Date(freshnessExpiresAt);
      }
      await db.update(questions).set(updateData).where(eq(questions.id, questionId));
      return { success: true };
    }),

  deleteQuestion: t.procedure
    .input(z.object({
      adminToken: z.string(),
      questionId: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      requireAdmin({ authorization: `Bearer ${input.adminToken}` });
      await db.delete(answers).where(eq(answers.questionId, input.questionId));
      await db.delete(questions).where(eq(questions.id, input.questionId));
      return { success: true };
    }),

  // --- NOUVEAU : startQuiz ---
  startQuiz: authenticated
    .input(startQuizSchema)
    .mutation(async ({ ctx, input }) => {
      const { sportId, categoryId, questionCount } = input;
      const userId = ctx.userId;

      // Vérification existence sport
      const [sport] = await db.select().from(sports).where(eq(sports.id, sportId)).limit(1);
      if (!sport) throw new TRPCError({ code: "NOT_FOUND", message: "Sport introuvable" });

      // Vérification catégorie
      if (categoryId) {
        const [category] = await db.select().from(categories).where(
          and(eq(categories.id, categoryId), eq(categories.sportId, sportId))
        ).limit(1);
        if (!category) throw new TRPCError({ code: "NOT_FOUND", message: "Catégorie invalide pour ce sport" });
      }

      let finalDifficulty: number;
      let sessionDifficulty: string;

      if (input.adaptive) {
        const recommended = await playerSkillService.recommendDifficulty(
          userId,
          sportId,
          categoryId
        );
        finalDifficulty = recommended;
        sessionDifficulty = recommended === 1 ? "easy" : recommended === 2 ? "medium" : "hard";
      } else {
        if (!input.difficulty) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "difficulty is required when adaptive is false" });
        }
        finalDifficulty = DIFFICULTY_MAP[input.difficulty];
        sessionDifficulty = input.difficulty;
      }

      // Sélection avec repli
      let candidates = await selectUnseenQuestions(sportId, categoryId, finalDifficulty, questionCount, userId);
      if (candidates.length < questionCount) {
        const extra = await selectUnseenFromSiblingCategories(
          sportId, categoryId, finalDifficulty, questionCount - candidates.length, userId
        );
        candidates = [...candidates, ...extra];
      }
      if (candidates.length < questionCount) {
        const fallback = await selectOldestSeen(
          sportId, categoryId, finalDifficulty, questionCount - candidates.length, userId
        );
        candidates = [...candidates, ...fallback];
      }

      if (candidates.length < questionCount) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: `Pas assez de questions disponibles. Trouvées : ${candidates.length}/${questionCount}`,
        });
      }

      const selected = shuffleArray(candidates).slice(0, questionCount);

      return await db.transaction(async (tx) => {
        const [session] = await tx.insert(quizSessions).values({
          userId,
          sportId,
          categoryId: categoryId || null,
          difficulty: sessionDifficulty,
          questionCount,
          status: "in_progress",
          startedAt: new Date(),
        }).returning();
        if (!session) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const sessionQuestionsValues = selected.map((q, idx) => ({
          sessionId: session.id,
          questionId: q.id,
          orderIndex: idx,
        }));
        await tx.insert(quizSessionQuestions).values(sessionQuestionsValues);

        for (const q of selected) {
          await tx
            .insert(userQuestionHistory)
            .values({
              userId,
              questionId: q.id,
              lastShownAt: new Date(),
              timesShown: 1,
            })
            .onConflictDoUpdate({
              target: [userQuestionHistory.userId, userQuestionHistory.questionId],
              set: {
                lastShownAt: new Date(),
                timesShown: sql`${userQuestionHistory.timesShown} + 1`,
              },
            });
        }

        return { sessionId: session.id, questionCount: selected.length };
      });
    }),

  getNextQuestion: authenticated
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { sessionId } = input;
      const userId = ctx.userId;

      const [session] = await db
        .select()
        .from(quizSessions)
        .where(and(eq(quizSessions.id, sessionId), eq(quizSessions.userId, userId)))
        .limit(1);
      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Session introuvable" });
      if (session.status !== "in_progress") throw new TRPCError({ code: "BAD_REQUEST", message: "Quiz déjà terminé" });

      const [nextQuestion] = await db
        .select({ id: quizSessionQuestions.questionId, orderIndex: quizSessionQuestions.orderIndex })
        .from(quizSessionQuestions)
        .leftJoin(
          quizAnswers,
          and(
            eq(quizAnswers.sessionId, sessionId),
            eq(quizAnswers.questionId, quizSessionQuestions.questionId),
            eq(quizAnswers.userId, userId)
          )
        )
        .where(and(eq(quizSessionQuestions.sessionId, sessionId), sql`${quizAnswers.id} IS NULL`))
        .orderBy(quizSessionQuestions.orderIndex)
        .limit(1);

      if (!nextQuestion) {
        await db.update(quizSessions)
          .set({ status: "completed", endedAt: new Date() })
          .where(eq(quizSessions.id, sessionId));
        return { done: true, message: "Quiz terminé" };
      }

      const [question] = await db.select().from(questions).where(eq(questions.id, nextQuestion.id)).limit(1);
      if (!question) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Question introuvable" });

      await db
        .insert(userQuestionHistory)
        .values({
          userId,
          questionId: question.id,
          lastShownAt: new Date(),
          timesShown: 1,
        })
        .onConflictDoUpdate({
          target: [userQuestionHistory.userId, userQuestionHistory.questionId],
          set: {
            lastShownAt: new Date(),
            timesShown: sql`${userQuestionHistory.timesShown} + 1`,
          },
        });

      const nonce = crypto.randomUUID();
      const now = new Date();
      await db
        .update(quizSessionQuestions)
        .set({ sentAt: now, nonce })
        .where(
          and(
            eq(quizSessionQuestions.sessionId, sessionId),
            eq(quizSessionQuestions.questionId, question.id)
          )
        );

      const questionAnswers = await db
        .select({
          id: answers.id,
          answerText: answers.answerText,
          order: answers.order,
        })
        .from(answers)
        .where(eq(answers.questionId, question.id))
        .orderBy(answers.order);

      return {
        done: false,
        question: {
          id: question.id,
          text: question.questionText,
          difficulty: question.difficultyLevel,
          answers: questionAnswers,
        },
        nonce,
        sentAt: now.toISOString(),
        currentIndex: nextQuestion.orderIndex,
        total: session.questionCount,
      };
    }),

  submitAnswer: authenticated
    .input(z.object({
      sessionId: z.string().uuid(),
      questionId: z.string().uuid(),
      nonce: z.string().uuid(),
      selectedAnswerId: z.string().uuid().nullable(),
      clientTimeMs: z.number().int().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId, questionId, nonce, selectedAnswerId } = input;
      const userId = ctx.userId;

      const [session] = await db
        .select()
        .from(quizSessions)
        .where(and(eq(quizSessions.id, sessionId), eq(quizSessions.userId, userId)))
        .limit(1);
      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Session introuvable" });
      if (session.status !== "in_progress") throw new TRPCError({ code: "BAD_REQUEST", message: "Quiz déjà terminé" });

      const [existingAnswer] = await db
        .select({ id: quizAnswers.id })
        .from(quizAnswers)
        .where(and(
          eq(quizAnswers.sessionId, sessionId),
          eq(quizAnswers.questionId, questionId),
          eq(quizAnswers.userId, userId)
        ))
        .limit(1);
      if (existingAnswer) throw new TRPCError({ code: "CONFLICT", message: "Question déjà répondue" });

      const [sessionQuestion] = await db
        .select({
          id: quizSessionQuestions.id,
          sentAt: quizSessionQuestions.sentAt,
          nonce: quizSessionQuestions.nonce,
        })
        .from(quizSessionQuestions)
        .where(and(
          eq(quizSessionQuestions.sessionId, sessionId),
          eq(quizSessionQuestions.questionId, questionId)
        ))
        .limit(1);
      if (!sessionQuestion) throw new TRPCError({ code: "BAD_REQUEST", message: "Question hors session" });

      if (sessionQuestion.nonce !== nonce) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nonce invalide" });
      }

      const now = new Date();
      const sentAt = sessionQuestion.sentAt ? new Date(sessionQuestion.sentAt) : now;
      const timeTakenMs = Math.min(now.getTime() - sentAt.getTime(), 120_000);

      let wasCorrect = false;
      if (selectedAnswerId) {
        const [selectedAnswer] = await db
          .select({ isCorrect: answers.isCorrect })
          .from(answers)
          .where(eq(answers.id, selectedAnswerId))
          .limit(1);
        wasCorrect = selectedAnswer?.isCorrect ?? false;
      }

      const [savedAnswer] = await db
        .insert(quizAnswers)
        .values({
          sessionId,
          questionId,
          userId,
          selectedAnswerId,
          isCorrect: wasCorrect,
          timeTakenMs,
          answeredAt: new Date(),
        })
        .returning();

      return {
        answerId: savedAnswer.id,
        wasCorrect,
        timeTakenMs,
      };
    }),

  endQuiz: authenticated
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { sessionId } = input;
      const userId = ctx.userId;

      const [session] = await db
        .select()
        .from(quizSessions)
        .where(and(eq(quizSessions.id, sessionId), eq(quizSessions.userId, userId)))
        .limit(1);
      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Session introuvable" });
      if (session.status !== "in_progress") throw new TRPCError({ code: "BAD_REQUEST", message: "Quiz déjà terminé" });

      const results = await db
        .select({
          wasCorrect: quizAnswers.isCorrect,
          timeTakenMs: quizAnswers.timeTakenMs,
        })
        .from(quizAnswers)
        .where(eq(quizAnswers.sessionId, sessionId));

      const POINTS_PER_CORRECT = 100;
      let totalScore = 0;
      for (const answer of results) {
        if (answer.wasCorrect) {
          const timeSeconds = (answer.timeTakenMs ?? 30000) / 1000;
          const speedBonus = Math.max(0, Math.floor((30 - timeSeconds) * 2));
          totalScore += POINTS_PER_CORRECT + speedBonus;
        }
      }

      await db
        .update(quizSessions)
        .set({ status: "completed", endedAt: new Date(), totalScore })
        .where(eq(quizSessions.id, sessionId));

      return {
        sessionId,
        totalScore,
        totalQuestions: session.questionCount,
        correctAnswers: results.filter(r => r.wasCorrect).length,
        status: "completed",
      };
    }),

  getQuizHistory: authenticated
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const sessions = await db
        .select({
          id: quizSessions.id,
          sportId: quizSessions.sportId,
          categoryId: quizSessions.categoryId,
          difficulty: quizSessions.difficulty,
          questionCount: quizSessions.questionCount,
          totalScore: quizSessions.totalScore,
          status: quizSessions.status,
          startedAt: quizSessions.startedAt,
          endedAt: quizSessions.endedAt,
        })
        .from(quizSessions)
        .where(eq(quizSessions.userId, ctx.userId))
        .orderBy(sql`${quizSessions.startedAt} DESC`)
        .limit(input.limit)
        .offset(input.offset);

      return sessions;
    }),
});

export type QuizRouter = typeof quizRouter;