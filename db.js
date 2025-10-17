// db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

// 🔑 Conexão direta via External Database URL
const connectionString = process.env.DATABASE_URL || 
  "postgresql://rotam_user:SENHA@dpg-xxxxx.oregon-postgres.render.com/rotam_database";

const pool = new Pool({
  connectionString,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

pool.on("connect", () => {
  console.log("🟢 Conectado ao PostgreSQL (via External URL + SSL).");
});

pool.on("error", (err) => {
  console.error("❌ Erro inesperado no pool:", err);
});

export default pool;
