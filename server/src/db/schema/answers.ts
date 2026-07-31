import { pgTable, uuid, text, boolean, integer } from "drizzle-orm/pg-core";
import { questions } from "./questions";

export const answers = pgTable("answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id").references(() => questions.id).notNull(),
  answerText: text("answer_text").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  order: integer("order").notNull(),
});