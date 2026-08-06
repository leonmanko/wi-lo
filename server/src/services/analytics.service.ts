import { db } from "../db";
import { playerQuestionTelemetry } from "../db/schema/player_question_telemetry";
import { questions } from "../db/schema/questions";
import { eq, sql } from "drizzle-orm";

export class QuestionAnalytics {
  /**
   * Retourne le taux de réussite (0-1) d'une question donnée.
   * Renvoie null si aucune donnée de télémétrie n'existe.
   */
  async getSuccessRate(questionId: string): Promise<number | null> {
    const result = await db
      .select({
        total: sql<number>`CAST(COUNT(*) AS INTEGER)`,
        correct: sql<number>`CAST(SUM(CASE WHEN ${playerQuestionTelemetry.wasCorrect} THEN 1 ELSE 0 END) AS INTEGER)`,
      })
      .from(playerQuestionTelemetry)
      .where(eq(playerQuestionTelemetry.questionId, questionId))
      .limit(1);

    const row = result[0];
    if (!row || row.total === 0) return null;

    return row.correct / row.total;
  }

  /**
   * Retourne le taux de réussite moyen pour un niveau de difficulté donné.
   */
  async getAverageSuccessRateByDifficulty(difficultyLevel: number): Promise<number | null> {
    const result = await db
      .select({
        total: sql<number>`CAST(COUNT(*) AS INTEGER)`,
        correct: sql<number>`CAST(SUM(CASE WHEN ${playerQuestionTelemetry.wasCorrect} THEN 1 ELSE 0 END) AS INTEGER)`,
      })
      .from(playerQuestionTelemetry)
      .innerJoin(questions, eq(questions.id, playerQuestionTelemetry.questionId))
      .where(eq(questions.difficultyLevel, difficultyLevel))
      .limit(1);

    const row = result[0];
    if (!row || row.total === 0) return null;
    return row.correct / row.total;
  }

  /**
   * Retourne les statistiques complètes d'une question.
   */
  async getQuestionStats(questionId: string) {
    const [successRate, [avgTimeResult]] = await Promise.all([
      this.getSuccessRate(questionId),
      db
        .select({
          avgTime: sql<number>`AVG(${playerQuestionTelemetry.responseTimeMs})`,
        })
        .from(playerQuestionTelemetry)
        .where(eq(playerQuestionTelemetry.questionId, questionId))
        .limit(1),
    ]);

    return {
      questionId,
      successRate,
      averageResponseTimeMs: avgTimeResult?.avgTime ?? null,
    };
  }
}

export const questionAnalytics = new QuestionAnalytics();