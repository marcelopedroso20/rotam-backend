// db.js
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000, // 10s
  idleTimeoutMillis: 30000 // 30s
});

pool.on("connect", () => {
  console.log("✅ Conectado ao banco PostgreSQL com sucesso!");
});

pool.on("error", (err) => {
  console.error("❌ Erro inesperado na conexão com o banco:", err);
});

export default pool;
