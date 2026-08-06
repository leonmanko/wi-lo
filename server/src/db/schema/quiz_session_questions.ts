import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { quizSessions } from "./quiz_sessions";
import { questions } from "./questions";

export const quizSessionQuestions = pgTable("quiz_session_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => quizSessions.id).notNull(),
  questionId: uuid("question_id").references(() => questions.id).notNull(),
  orderIndex: integer("order_index").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  nonce: uuid("nonce"),
});