// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pool from "./db.js";

import authRoutes from "./routes/auth.js";
import efetivoRoutes from "./routes/efetivo.js";
import occurrencesRoutes from "./routes/occurrences.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🌍 Middlewares globais
app.use(cors({
  origin: "*", // Ajuste depois para o domínio do seu frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));

// 🔍 Rota inicial (status da API)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "🚀 API ROTAM Backend funcionando e online!",
    versao: "1.0.0",
  });
});

// 🚦 Rotas principais
app.use("/api/auth", authRoutes);
app.use("/api/efetivo", efetivoRoutes);
app.use("/api/occurrences", occurrencesRoutes);

// 🛠️ Setup: cria tabela 'usuarios' e usuário padrão adm/adm (com hash)
app.get("/setup-admin", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        usuario TEXT UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const username = "adm";
    const plain = "adm";
    const hash = await bcrypt.hash(plain, 10);

    const result = await pool.query(
      \`INSERT INTO usuarios (usuario, senha_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (usuario) DO NOTHING
       RETURNING id\`,
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "❌ Rota não encontrada.", rota: req.originalUrl });
});

// ⚙️ Inicialização
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log("🔗 Rotas:");
  console.log("   → GET  /");
  console.log("   → GET  /setup-admin");
  console.log("   → POST /api/auth/login");
  console.log("   → CRUD /api/efetivo");
  console.log("   → CRUD /api/occurrences");
});
