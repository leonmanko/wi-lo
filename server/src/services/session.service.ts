import { supabase } from "../config/supabase";
import { db } from "../db";
import { sessions } from "../db/schema/sessions";
import { devices } from "../db/schema/devices";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export class SessionService {
  async createSession(userId: string, accessToken: string, refreshToken: string, deviceFingerprint?: string, ipAddress?: string) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    await db.insert(sessions).values({
      userId,
      token,
      expiresAt,
      deviceFingerprint,
      ipAddress,
    });

    return { token, accessToken, refreshToken };
  }

  async validateSession(token: string, deviceFingerprint?: string, ipAddress?: string) {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });

    if (!session) throw new Error("Session not found");
    if (session.expiresAt < new Date()) {
      await db.delete(sessions).where(eq(sessions.id, session.id));
      throw new Error("Session expired");
    }

    // Vérification device fingerprint
    if (deviceFingerprint && session.deviceFingerprint && session.deviceFingerprint !== deviceFingerprint) {
      await this.revokeAllSessions(session.userId, "suspicious_device_change");
      throw new Error("Suspicious device change detected");
    }

    // Vérification géolocalisation impossible
    if (ipAddress && session.ipAddress) {
      const isSuspicious = await this.checkImpossibleTravel(session.ipAddress, ipAddress);
      if (isSuspicious) {
        await this.revokeAllSessions(session.userId, "impossible_travel");
        throw new Error("Impossible travel detected");
      }
    }

    return session;
  }

  async rotateTokens(sessionToken: string, newAccessToken: string, newRefreshToken: string) {
    await db
      .update(sessions)
      .set({ token: crypto.randomUUID(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
      .where(eq(sessions.token, sessionToken));

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async revokeAllSessions(userId: string, reason: string) {
    console.warn(`Révocation des sessions pour ${userId}: ${reason}`);
    await db.delete(sessions).where(eq(sessions.userId, userId));
    await supabase.auth.admin.signOut(userId);
  }

  async revokeSession(token: string) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async updateDeviceTrust(userId: string, fingerprintHash: string, trustChange: number) {
    const device = await db.query.devices.findFirst({
      where: and(
        eq(devices.userId, userId),
        eq(devices.fingerprintHash, fingerprintHash),
      ),
    });

    if (device) {
      await db
        .update(devices)
        .set({ trustScore: Math.max(0, Math.min(100, device.trustScore + trustChange)), lastSeenAt: new Date() })
        .where(eq(devices.id, device.id));
    }
  }

  private async checkImpossibleTravel(previousIp: string, currentIp: string): Promise<boolean> {
    // Simplified: if IPs are completely different, flag as suspicious
    // Production: use GeoIP database to calculate distance and time
    const prevParts = previousIp.split(".").slice(0, 2).join(".");
    const currParts = currentIp.split(".").slice(0, 2).join(".");
    return prevParts !== currParts;
  }
}

export const sessionService = new SessionService();