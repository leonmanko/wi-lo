import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { sports } from "./sports";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  sportId: uuid("sport_id").references(() => sports.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
});