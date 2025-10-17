// db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    require: true,
    rejectUnauthorized: false, // 🔑 obrigatório no Render
  },
  connectionTimeoutMillis: 10000, // evita travar em timeout
  idleTimeoutMillis: 30000,       // fecha conexões ociosas
});

pool.on("connect", () => {
  console.log("🟢 Conectado ao PostgreSQL com SSL");
});

pool.on("error", (err) => {
  console.error("❌ Erro inesperado no pool de conexões:", err);
});

export default pool;
