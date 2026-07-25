import postgres from "postgres";

const connectionString = `postgresql://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_DB_HOST}:${process.env.SUPABASE_DB_PORT}/${process.env.SUPABASE_DB_NAME}?sslmode=require`;

async function testConnection() {
  console.log("Test de connexion a Supabase...");
  const client = postgres(connectionString, { max: 1 });
  const result = await client`SELECT version()`;
  console.log("✅ Connecte ! PostgreSQL:", result[0].version);
  await client.end();
}

testConnection().catch((err) => {
  console.error("❌ Erreur:", err.message);
  process.exit(1);
});