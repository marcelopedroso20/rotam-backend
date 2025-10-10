import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

// 🧱 Cria a conexão com o PostgreSQL (Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessário no Railway
  },
});

// 🧩 Função de verificação de conexão (opcional)
pool.connect()
  .then(() => console.log("🟢 Banco de dados conectado com sucesso (PostgreSQL - Railway)"))
  .catch((err) => console.error("🔴 Erro ao conectar ao banco:", err.message));

// 🧠 Função auxiliar para consultas SQL
export async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error("Erro na query:", error.message);
    throw error;
  }
}

// 🔁 Tratamento de falha de conexão automática (Railway pode reiniciar às vezes)
pool.on("error", (err) => {
  console.error("⚠️ Conexão com o banco perdida. Tentando reconectar...", err.message);
});

export default pool;
