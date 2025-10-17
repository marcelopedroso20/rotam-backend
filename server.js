// ===============================
// 🚓 ROTAM Backend v2 - Servidor Principal (corrigido)
// ===============================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pool from "./db.js";

import setupDbRoutes from "./routes/setup-db.js";
import authRoutes from "./routes/auth.js";
import efetivoRoutes from "./routes/efetivo.js";
import viaturasRoutes from "./routes/viaturas.js";
import occurrencesRoutes from "./routes/occurrences.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🌍 Middlewares globais
app.use(
  cors({
    origin: "*", // pode limitar a origem se quiser
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));

// 📂 Arquivos estáticos (mapa Leaflet)
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/public", express.static(path.join(__dirname, "public")));

// 🔍 Rota inicial (status da API)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "🚀 API ROTAM Backend v2 online!",
    versao: "2.0.0",
    docs: {
      setup_admin: "/setup-admin",
      setup_db: "/setup-db",
      gen_hash: "/gen-hash/:senha",
    },
  });
});

// 🚦 Rotas principais
app.use("/api/auth", authRoutes);
app.use("/api/efetivo", efetivoRoutes);
app.use("/api/viaturas", viaturasRoutes);
app.use("/api/occurrences", occurrencesRoutes);
app.use("/setup-db", setupDbRoutes);

// 🛠️ Criação do admin
app.get("/setup-admin", async (req, res) => {
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
  } catch (e) {
    console.error("Erro no setup-admin:", e.message);
    res.status(500).json({ success: false, error: "Erro ao criar admin: " + e.message });
  }
});

// 🧰 Setup das tabelas principais
app.get("/setup-db", async (req, res) => {
  try {
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
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 🔐 Geração de hash para senha (testar bcryptjs no Railway)
app.get("/gen-hash/:senha", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.params.senha, 10);
    res.json({ success: true, senha: req.params.senha, hash });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 🌍 Endpoints públicos do mapa Leaflet
app.get("/api/map/efetivo", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nome, patente, setor, turno, viatura, status, latitude, longitude, atualizado_em FROM efetivo WHERE latitude IS NOT NULL AND longitude IS NOT NULL"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/map/viaturas", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, prefixo, placa, modelo, status, latitude, longitude, atualizado_em FROM viaturas WHERE latitude IS NOT NULL AND longitude IS NOT NULL"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/map/occurrences", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, titulo, data, status, latitude, longitude FROM occurrences WHERE latitude IS NOT NULL AND longitude IS NOT NULL ORDER BY id DESC LIMIT 300"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 🚫 404 handler (deixa sempre por último!)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "❌ Rota não encontrada.",
    rota: req.originalUrl,
  });
});

// ⚙️ Inicialização
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log("🔗 Rotas principais:");
  console.log("   → GET  /");
  console.log("   → GET  /setup-admin");
  console.log("   → GET  /setup-db");
  console.log("   → GET  /gen-hash/:senha");
  console.log("   → POST /api/auth/login");
});
