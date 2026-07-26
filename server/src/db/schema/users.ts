import { pgTable, uuid, text, timestamp, date } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  openId: text("open_id").unique().notNull(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in"),
  birthDate: date("birth_date").notNull(),
});
