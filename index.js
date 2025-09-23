// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./db.js";              // ⬅️ usa sua conexão existente
import occurrencesRouter from "./routes/occurrences.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para aceitar JSON
app.use(express.json());

// Habilitar CORS para permitir requisições do frontend
app.use(
  cors({
    origin: "*", // 🔓 libera para qualquer origem (depois você pode restringir ao seu GitHub Pages)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// -------------------------- ROTAS TEMPORÁRIAS DE SETUP --------------------------
// 1) Cria a tabela 'users' se não existir
app.get("/setup-users-table", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    res.send("✅ Tabela 'users' verificada/criada com sucesso.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar/verificar a tabela 'users'.");
  }
});

// 2) Cria o usuário admin (adm/adm) caso não exista
app.get("/create-admin", async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      ["adm", "adm", "admin"]
    );
    if (rowCount === 0) {
      return res.send("ℹ️ Usuário 'adm' já existe. Nada foi alterado.");
    }
    res.send("✅ Usuário 'adm' criado com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar usuário admin.");
  }
});
// -----------------------------------------------------------------------------

// Rota principal (healthcheck)
app.get("/", (_req, res) => {
  res.send("🚔 API ROTAM Backend funcionando!");
});

// (Opcional) Rota de login simples: confere na tabela 'users'
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "Informe usuário e senha." });
    }

    const { rows } = await pool.query(
      "SELECT id, username, password, role FROM users WHERE username = $1 LIMIT 1",
      [username]
    );

    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(401).json({ error: "Usuário ou senha inválidos." });
    }

    const user = rows[0];
    return res.json({
      ok: true,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no login." });
  }
});

// Suas rotas de ocorrências
app.use("/occurrences", occurrencesRouter);

// Start
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
