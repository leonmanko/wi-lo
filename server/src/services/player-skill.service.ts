import { db } from "../db";
import { playerQuestionTelemetry } from "../db/schema/player_question_telemetry";
import { questions } from "../db/schema/questions";
import { categories } from "../db/schema/categories";
import { eq, and, sql, gte, desc } from "drizzle-orm";

export type DifficultyLevel = 1 | 2 | 3;

interface PerformanceWindow {
  total: number;
  correct: number;
  averageTimeMs: number;
}

export class PlayerSkillService {
  private readonly RECENT_QUESTIONS_COUNT = 20;
  private readonly HIGH_SUCCESS_THRESHOLD = 0.8;
  private readonly LOW_SUCCESS_THRESHOLD = 0.4;
  private readonly FAST_TIME_MS = 5000; // si moyenne < 5s, on monte plus vite
  private readonly SLOW_TIME_MS = 15000; // si moyenne > 15s, on baisse

  /**
   * Recommande un niveau de difficulté (1-3) basé sur l'historique récent du joueur.
   */
  async recommendDifficulty(
    userId: string,
    sportId?: string,
    categoryId?: string
  ): Promise<DifficultyLevel> {
    const recentPerformance = await this.getRecentPerformance(userId, sportId, categoryId);

    // Pas assez de données -> difficulté par défaut 2 (moyen)
    if (recentPerformance.total < 5) {
      return 2;
    }

    const successRate = recentPerformance.correct / recentPerformance.total;
    const avgTime = recentPerformance.averageTimeMs;

    // Logique d'ajustement
    if (successRate >= this.HIGH_SUCCESS_THRESHOLD) {
      // Très bon -> augmenter la difficulté, encore plus si rapide
      if (avgTime <= this.FAST_TIME_MS) {
        return 3;
      }
      return 3;
    } else if (successRate <= this.LOW_SUCCESS_THRESHOLD) {
      // Très mauvais -> baisser la difficulté, encore plus si lent
      if (avgTime >= this.SLOW_TIME_MS) {
        return 1;
      }
      return 1;
    } else {
      // Performance moyenne -> ajustement fin
      if (successRate > 0.6) {
        // Plutôt bon -> tendance à monter
        return avgTime <= this.FAST_TIME_MS ? 3 : 2;
      } else {
        // Plutôt faible -> tendance à baisser
        return avgTime >= this.SLOW_TIME_MS ? 1 : 2;
      }
    }
  }

  /**
   * Récupère les performances récentes sur les N dernières questions répondues,
   * éventuellement filtrées par sport/catégorie.
   */
  private async getRecentPerformance(
    userId: string,
    sportId?: string,
    categoryId?: string
  ): Promise<PerformanceWindow> {
    const baseQuery = db
      .select({
        wasCorrect: playerQuestionTelemetry.wasCorrect,
        responseTimeMs: playerQuestionTelemetry.responseTimeMs,
      })
      .from(playerQuestionTelemetry)
      .innerJoin(questions, eq(questions.id, playerQuestionTelemetry.questionId));

    let rows;
    if (categoryId) {
      rows = await baseQuery
        .where(and(
          eq(playerQuestionTelemetry.userId, userId),
          eq(questions.categoryId, categoryId)
        ))
        .orderBy(desc(playerQuestionTelemetry.createdAt))
        .limit(this.RECENT_QUESTIONS_COUNT);
    } else if (sportId) {
      rows = await baseQuery
        .innerJoin(categories, eq(categories.id, questions.categoryId))
        .where(and(
          eq(playerQuestionTelemetry.userId, userId),
          eq(categories.sportId, sportId)
        ))
        .orderBy(desc(playerQuestionTelemetry.createdAt))
        .limit(this.RECENT_QUESTIONS_COUNT);
    } else {
      rows = await baseQuery
        .where(eq(playerQuestionTelemetry.userId, userId))
        .orderBy(desc(playerQuestionTelemetry.createdAt))
        .limit(this.RECENT_QUESTIONS_COUNT);
    }

    if (rows.length === 0) {
      return { total: 0, correct: 0, averageTimeMs: 0 };
    }

    const total = rows.length;
    const correct = rows.filter(r => r.wasCorrect).length;
    const totalTime = rows.reduce((sum, r) => sum + r.responseTimeMs, 0);
    const averageTimeMs = Math.round(totalTime / total);

    return { total, correct, averageTimeMs };
  }
}

export const playerSkillService = new PlayerSkillService();