import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  questionText: text("question_text").notNull(),
  difficultyLevel: integer("difficulty_level").default(1).notNull(),
  sourceFactId: text("source_fact_id"),
  freshnessExpiresAt: timestamp("freshness_expires_at"),
  createdBy: text("created_by").default("ai").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});