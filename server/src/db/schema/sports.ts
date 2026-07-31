import { pgTable, uuid, text } from "drizzle-orm/pg-core";

export const sports = pgTable("sports", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").unique().notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  accentColor: text("accent_color").notNull(),
});