import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { questions } from "./questions";

export const questionMedia = pgTable("question_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id").references(() => questions.id).notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(),
});