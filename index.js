// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import pool from "./db.js";                  // <--- usa sua conexão pg
import occurrencesRouter from "./routes/occurrences.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: "*", // pode restringir depois para seu GitHub Pages
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Rota principal
app.get("/", (req, res) => {
  res.send("🚔 API ROTAM Backend funcionando!");
});

// =====================
//  ROTAS DE SETUP (TEMPORÁRIAS)
// =====================

// 1) Cria/garante a tabela users
app.get("/setup-users-table", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    res.send("✅ Tabela 'users' verificada/criada com sucesso.");
  } catch (e) {
    console.error("Erro ao criar tabela users:", e);
    res
      .status(500)
      .send("❌ Erro ao criar tabela users: " + (e?.message || "desconhecido"));
  }
});

// 2) Cria o usuário admin (adm/adm) se ainda não existir
app.get("/create-admin", async (req, res) => {
  try {
    const username = "adm";
    const password = "adm";

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING
       RETURNING id`,
      [username, hash, "admin"]
    );

    if (result.rowCount === 0) {
      return res.send("ℹ️ Usuário 'adm' já existe. Nada a fazer.");
    }
    res.send("✅ Usuário admin criado com sucesso (adm/adm).");
  } catch (e) {
    console.error("Erro ao criar usuário admin:", e);
    res
      .status(500)
      .send("❌ Erro ao criar usuário admin: " + (e?.message || "desconhecido"));
  }
});

// =====================
//  LOGIN REAL (usar depois no frontend)
// =====================
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "Informe usuário e senha." });
    }

    const { rows } = await pool.query(
      "SELECT id, username, password_hash, role FROM users WHERE username = $1",
      [username]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // Sem JWT/cookies por enquanto — devolvemos info básica
    res.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (e) {
    console.error("Erro no login:", e);
    res
      .status(500)
      .json({ error: "Erro interno no login", detail: e?.message || "" });
  }
});

// Rotas de ocorrências
app.use("/occurrences", occurrencesRouter);

// Start
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
