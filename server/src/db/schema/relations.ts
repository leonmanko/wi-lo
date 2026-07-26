import { relations } from "drizzle-orm";
import { users } from "./users";
import { sessions } from "./sessions";
import { userProfiles } from "./user_profiles";
import { devices } from "./devices";
import { consentRecords } from "./consent_records";

export const usersRelations = relations(users, ({ one, many }) => ({
  sessions: many(sessions),
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  devices: many(devices),
  consentRecords: many(consentRecords),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const devicesRelations = relations(devices, ({ one }) => ({
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
}));

export const consentRecordsRelations = relations(consentRecords, ({ one }) => ({
  user: one(users, {
    fields: [consentRecords.userId],
    references: [users.id],
  }),
}));