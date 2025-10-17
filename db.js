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
    require: true,                // Render exige SSL
    rejectUnauthorized: false     // Ignora certificado self-signed
  },
  connectionTimeoutMillis: 0,     // sem timeout de conexão
  idleTimeoutMillis: 0,           // mantém a conexão viva
  keepAlive: true,                // mantém socket ativo
  max: 2                          // limite pequeno p/ plano free
});

pool.on("connect", () => console.log("🟢 Conectado ao PostgreSQL via SSL"));
pool.on("error", (err) => console.error("⚠️ Erro no pool de conexões:", err));

export default pool;
