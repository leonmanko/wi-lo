import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const consentRecords = pgTable("consent_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  consentType: text("consent_type").notNull(),
  granted: boolean("granted").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});