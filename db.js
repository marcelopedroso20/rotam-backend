// db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL não definida no .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { require: true, rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

pool.on("connect", () => {
  console.log("🟢 Conectado ao PostgreSQL (SSL).");
});

pool.on("error", (err) => {
  console.error("❌ Erro inesperado no pool:", err);
});

export default pool;
