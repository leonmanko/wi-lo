const postgres = require("postgres");

const host = process.env.SUPABASE_DB_HOST;
const port = process.env.SUPABASE_DB_PORT;
const user = process.env.SUPABASE_DB_USER;
const password = process.env.SUPABASE_DB_PASSWORD;
const db = process.env.SUPABASE_DB_NAME;

const url = `postgresql://${user}:${password}@${host}:${port}/${db}?sslmode=require`;
console.log("Connexion a:", url.replace(password, "***"));

const client = postgres(url, { max: 1 });

client`SELECT version()`
  .then((r) => {
    console.log("✅", r[0].version);
    client.end();
  })
  .catch((e) => {
    console.error("❌", e.message);
    client.end();
  });