// ===============================
// 🚓 ROTAM Backend v2.2.0 - Servidor Principal
// ===============================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";

// Rotas
import authRoutes from "./routes/auth.js";
import efetivoRoutes from "./routes/efetivo.js";
import viaturasRoutes from "./routes/viaturas.js";
import occurrencesRoutes from "./routes/occurrences.js";
import dbTestRoutes from "./routes/dbtest.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// 🌍 CORS
// ===============================
function parseAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) {
    return [
      "https://marcelopedroso20.github.io",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
    ];
  }
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}
const allowedOrigins = new Set(parseAllowedOrigins());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
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
// 📂 Arquivos estáticos (ex: mapas Leaflet)
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
    message: "🚀 API ROTAM Backend v2.2.0 online!",
    versao: "2.2.0",
    docs: {
      setup_admin: "/setup-admin",
      setup_db: "/setup-db",
      gen_hash: "/gen-hash/:senha",
      db_test: "/db-test",
    },
  });
});

// ===============================
// 🔐 Rotas principais
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/efetivo", efetivoRoutes);
app.use("/api/viaturas", viaturasRoutes);
app.use("/api/occurrences", occurrencesRoutes);
app.use("/db-test", dbTestRoutes);

// ===============================
/* 🛠️ Setup das tabelas (padronizado) */
// ===============================
app.get("/setup-db", async (_req, res) => {
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS efetivo (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        patente TEXT NOT NULL,
        funcao TEXT,
        setor TEXT,
        turno TEXT,
        viatura TEXT,
        placa TEXT,
        status TEXT DEFAULT 'Disponível',
        latitude NUMERIC(9,6),
        longitude NUMERIC(9,6),
        foto TEXT,
        atualizado_em TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS viaturas (
        id SERIAL PRIMARY KEY,
        prefixo TEXT UNIQUE NOT NULL,
        placa TEXT,
        modelo TEXT,
        status TEXT DEFAULT 'Disponível',
        localizacao TEXT,
        latitude NUMERIC(9,6),
        longitude NUMERIC(9,6),
        atualizado_em TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS occurrences (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT,
        data TIMESTAMPTZ DEFAULT NOW(),
        local TEXT,
        latitude NUMERIC(9,6),
        longitude NUMERIC(9,6),
        equipe_id INTEGER,
        equipe_nome TEXT,
        status TEXT DEFAULT 'Concluída',
        observacoes TEXT,
        registrado_por TEXT
      );
    `);

    res.json({ success: true, message: "✅ Tabelas criadas/verificadas com sucesso." });
  } catch (err) {
    console.error("Erro no setup-db:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===============================
// 🛠️ Criação do admin
// ===============================
import jwt from "jsonwebtoken";
app.get("/setup-admin", async (_req, res) => {
  try {
    const username = "adm";
    const plain = "adm";
    const hash = await bcrypt.hash(plain, 10);

    const r = await pool.query(
      `INSERT INTO usuarios (usuario, senha_hash, role)
       VALUES ($1,$2,$3)
       ON CONFLICT (usuario) DO NOTHING
       RETURNING id`,
      [username, hash, "admin"]
    );

    const created = r.rowCount > 0;
    res.json({
      success: true,
      message: created ? "✅ Usuário admin criado (adm/adm)." : "ℹ️ Usuário 'adm' já existe.",
    });
  } catch (err) {
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
// 🌍 Endpoints públicos para o mapa (Leaflet)
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

// ===============================
// 🚫 Rota 404
// ===============================
app.use((req, res) => {
  res.status(404).json({ success: false, error: "❌ Rota não encontrada.", rota: req.originalUrl });
});

// ===============================
// ⚙️ Inicialização
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log("🔗 Rotas principais:");
  console.log("   → GET  /");
  console.log("   → GET  /setup-admin");
  console.log("   → GET  /setup-db");
  console.log("   → GET  /db-test");
  console.log("   → GET  /gen-hash/:senha");
  console.log("   → POST /api/auth/login");
});
