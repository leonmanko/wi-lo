import { db } from "../db";
import { consentRecords } from "../db/schema/consent_records";
import { eq, and } from "drizzle-orm";

export class ConsentService {
  async record(userId: string, consentType: string, granted: boolean) {
    await db.delete(consentRecords).where(
      and(
        eq(consentRecords.userId, userId),
        eq(consentRecords.consentType, consentType),
      ),
    );

    await db.insert(consentRecords).values({
      userId,
      consentType,
      granted,
    });

    return { userId, consentType, granted };
  }

  async getConsents(userId: string) {
    return db.query.consentRecords.findMany({
      where: eq(consentRecords.userId, userId),
    });
  }

  async hasConsented(userId: string, consentType: string): Promise<boolean> {
    const record = await db.query.consentRecords.findFirst({
      where: and(
        eq(consentRecords.userId, userId),
        eq(consentRecords.consentType, consentType),
      ),
    });
    return record?.granted ?? false;
  }
}

export const consentService = new ConsentService();