// db.js - conexão PostgreSQL
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL não definida no ambiente.");
}

const pool = new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes("render.com")
    ? { rejectUnauthorized: false }
    : (process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false),
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("connect", () => console.log("🟢 Pool conectado ao PostgreSQL."));
pool.on("error", (err) => console.error("❌ Erro no pool PostgreSQL:", err));

export default pool;
