import { pgTable, uuid, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { questions } from "./questions";

export const playerQuestionTelemetry = pgTable("player_question_telemetry", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  questionId: uuid("question_id").references(() => questions.id).notNull(),
  wasCorrect: boolean("was_correct").notNull(),
  responseTimeMs: integer("response_time_ms").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});