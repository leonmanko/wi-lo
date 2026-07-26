import { pgTable, uuid, text, timestamp, inet } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  deviceFingerprint: text("device_fingerprint"),
  ipAddress: inet("ip_address"),
});