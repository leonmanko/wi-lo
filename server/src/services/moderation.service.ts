import { db } from "../db";

const FORBIDDEN_WORDS = ["insulte1", "insulte2", "spam"];

export class ModerationService {
  checkText(text: string): { clean: boolean; reason?: string } {
    const lower = text.toLowerCase();
    for (const word of FORBIDDEN_WORDS) {
      if (lower.includes(word)) {
        return { clean: false, reason: `Forbidden word detected` };
      }
    }
    if (text.length > 50) {
      return { clean: false, reason: "Text too long" };
    }
    return { clean: true };
  }

  checkImage(mimeType: string, size: number): { clean: boolean; reason?: string } {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(mimeType)) {
      return { clean: false, reason: "Invalid image type" };
    }
    if (size > 5 * 1024 * 1024) {
      return { clean: false, reason: "Image too large" };
    }
    return { clean: true };
  }

  async reportUser(reportedUserId: string, reportedByUserId: string, reason: string) {
    console.warn(`[MODERATION] User ${reportedUserId} reported by ${reportedByUserId}: ${reason}`);
    return { success: true, message: "Report submitted" };
  }

  async reportProfile(reportedUserId: string, reportedByUserId: string, reason: string) {
    console.warn(`[MODERATION] Profile ${reportedUserId} reported by ${reportedByUserId}: ${reason}`);
    return { success: true, message: "Profile reported" };
  }
}

export const moderationService = new ModerationService();