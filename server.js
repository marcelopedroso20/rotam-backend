// ===============================
// 🚓 ROTAM Backend v2 - Servidor Principal (Render)
// ===============================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pool from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

// Rotas
import dbTestRoutes from "./routes/dbtest.js";
import setupDbRoutes from "./routes/setup-db.js";
import authRoutes from "./routes/auth.js";
import efetivoRoutes from "./routes/efetivo.js";
import viaturasRoutes from "./routes/viaturas.js";
import occurrencesRoutes from "./routes/occurrences.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// 🌍 CORS
// ===============================
const allowedOrigins = [
  "https://marcelopedroso20.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("🚫 CORS bloqueado para origem:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// ===============================
// 📂 Arquivos estáticos
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/public", express.static(path.join(__dirname, "public")));

// ===============================
// 🔍 Status da API
// ===============================
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "🚀 API ROTAM Backend v2 online no Render!",
    versao: "2.1.0",
    docs: {
      setup_admin: "/setup-admin",
      setup_db: "/setup-db",
      gen_hash: "/gen-hash/:senha",
      db_test: "/db-test",
    },
  });
});

// ===============================
// 🚦 Rotas
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/efetivo", efetivoRoutes);
app.use("/api/viaturas", viaturasRoutes);
app.use("/api/occurrences", occurrencesRoutes);
app.use("/setup-db", setupDbRoutes);
app.use("/db-test", dbTestRoutes);

// ===============================
// 🛠️ Criação do admin
// ===============================
app.get("/setup-admin", async (_req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        usuario TEXT UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const username = "adm";
    const plain = "adm";
    const hash = await bcrypt.hash(plain, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (usuario, senha_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (usuario) DO NOTHING
       RETURNING id`,
      [username, hash, "admin"]
    );

    if (result.rowCount === 0) {
      return res.json({ success: true, message: "ℹ️ Usuário 'adm' já existe." });
    }

    res.json({ success: true, message: "✅ Usuário admin criado (adm/adm)." });
  } catch (err) {
    console.error("Erro no setup-admin:", err.message);
    res.status(500).json({ success: false, error: "Erro ao criar admin: " + err.message });
  }
});

// ===============================
// 🔐 Geração de hash (teste)
// ===============================
app.get("/gen-hash/:senha", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.params.senha, 10);
    res.json({ success: true, senha: req.params.senha, hash });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===============================
// 🌍 Endpoints públicos de mapa
// ===============================
app.get("/api/map/efetivo", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, nome, patente, setor, turno, viatura, status, latitude, longitude, atualizado_em
      FROM efetivo
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/map/viaturas", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, prefixo, placa, modelo, status, latitude, longitude, atualizado_em
      FROM viaturas
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/map/occurrences", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, titulo, data, status, latitude, longitude
      FROM occurrences
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      ORDER BY id DESC
      LIMIT 300
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "❌ Rota não encontrada.",
    rota: req.originalUrl,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
