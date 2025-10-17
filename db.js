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
    rejectUnauthorized: false, // ignora certificados autoassinados
  },
  max: 3, // Render free não suporta muitos clientes simultâneos
  connectionTimeoutMillis: 10000, // 10s
  idleTimeoutMillis: 10000, // encerra conexões ociosas mais rápido
  keepAlive: true, // mantém o socket ativo
});

pool.on("connect", () => console.log("🟢 Pool conectado ao PostgreSQL (Render)"));
pool.on("error", (err) => console.error("⚠️ Erro no pool:", err));

export default pool;
