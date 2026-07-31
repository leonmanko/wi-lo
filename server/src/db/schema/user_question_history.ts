import { pgTable, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { questions } from "./questions";

export const userQuestionHistory = pgTable("user_question_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  questionId: uuid("question_id").references(() => questions.id).notNull(),
  lastShownAt: timestamp("last_shown_at").defaultNow().notNull(),
  timesShown: integer("times_shown").default(1).notNull(),
});