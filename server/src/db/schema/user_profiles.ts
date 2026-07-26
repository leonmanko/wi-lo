import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id").references(() => users.id).primaryKey(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  totalCoins: integer("total_coins").default(0).notNull(),
  totalDiamonds: integer("total_diamonds").default(0).notNull(),
  favoriteSport: text("favorite_sport"),
  favoriteTeam: text("favorite_team"),
});