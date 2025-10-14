// db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then((c) => { console.log("🟢 Banco conectado (PostgreSQL - Railway)"); c.release(); })
  .catch((err) => console.error("🔴 Erro ao conectar ao banco:", err.message));

pool.on("error", (err) => console.error("⚠️ Conexão perdida:", err.message));

export default pool;
