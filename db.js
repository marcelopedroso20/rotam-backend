import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessário no Railway
  },
});

// Teste de conexão (só aparece nos logs do Railway)
pool.connect()
  .then(() => console.log("✅ Conectado ao banco com sucesso!"))
  .catch(err => console.error("❌ Erro ao conectar no banco:", err));

export default pool;
