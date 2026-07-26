import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { users } from "./schema/users";
import { userProfiles } from "./schema/user_profiles";
import { devices } from "./schema/devices";
import { consentRecords } from "./schema/consent_records";

const connectionString = `postgresql://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_DB_HOST}:${process.env.SUPABASE_DB_PORT}/${process.env.SUPABASE_DB_NAME}?sslmode=require`;

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function seed() {
  console.log("🌱 Seed des donnees de test...");

  const userId = crypto.randomUUID();

  await db.insert(users).values({
    id: userId,
    openId: "test-open-id",
    email: "test@wi-lo.app",
    name: "Joueur Test",
    role: "user",
    birthDate: "2000-01-01",
  });

  await db.insert(userProfiles).values({
    userId: userId,
    bio: "Compte de test WI-LO",
    level: 5,
    xp: 1200,
    totalCoins: 500,
    favoriteSport: "football",
  });

  await db.insert(devices).values({
    userId: userId,
    fingerprintHash: "test-device-fingerprint",
    trustScore: 100,
  });

  await db.insert(consentRecords).values({
    userId: userId,
    consentType: "privacy_policy",
    granted: true,
  });

  await db.insert(consentRecords).values({
    userId: userId,
    consentType: "personalized_ads",
    granted: false,
  });

  console.log("✅ Seed termine !");
  await client.end();
}

seed().catch((err) => {
  console.error("❌ Erreur seed:", err);
  client.end();
  process.exit(1);
});