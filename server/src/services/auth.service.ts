import { supabase } from "../config/supabase";
import { db } from "../db";
import { users } from "../db/schema/users";
import { userProfiles } from "../db/schema/user_profiles";
import { eq } from "drizzle-orm";
import { ageService } from "./age.service";

export class AuthService {
  async signUp(email: string, password: string, name: string, birthDate: string) {
    const ageCheck = ageService.verifyAge(birthDate);
    if (!ageCheck.canRegister) {
      throw new Error("You must be at least 13 years old to register");
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, birthDate, isMinor: ageCheck.isMinor },
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("User creation failed");

    await db.insert(users).values({
      id: data.user.id,
      openId: data.user.id,
      email: data.user.email!,
      name,
      birthDate,
      role: "user",
    });

    await db.insert(userProfiles).values({
      userId: data.user.id,
    });

    return { id: data.user.id, email: data.user.email };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    await db
      .update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, data.user.id));

    return {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: { id: data.user.id, email: data.user.email },
    };
  }

  async signOut(userId: string) {
    const { error } = await supabase.auth.admin.signOut(userId);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  async getUser(userId: string) {
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return result[0] || null;
  }
}

export const authService = new AuthService();