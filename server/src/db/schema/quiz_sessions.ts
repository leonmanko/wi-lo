import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { sports } from "./sports";
import { categories } from "./categories";

export const quizSessions = pgTable("quiz_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  sportId: uuid("sport_id").references(() => sports.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  difficulty: text("difficulty").notNull(),
  questionCount: integer("question_count").notNull(),
  status: text("status").default("in_progress").notNull(),
  totalScore: integer("total_score").default(0),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});