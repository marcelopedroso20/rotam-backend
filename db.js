// db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

// 🧱 Conexão única com PostgreSQL (Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Log de status inicial
pool.connect()
  .then((c) => {
    console.log("🟢 Banco conectado com sucesso (PostgreSQL - Railway)");
    c.release();
  })
  .catch((err) => console.error("🔴 Erro ao conectar ao banco:", err.message));

// Helper de query (opcional)
export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

// Reconexão automática
pool.on("error", (err) => {
  console.error("⚠️ Conexão com o banco perdida:", err.message);
});

export default pool;
