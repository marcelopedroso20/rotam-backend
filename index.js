// index.js  (cole inteiro, substituindo o existente)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import pool from "./db.js";               // sua conexão pg (assume export default pool)
import occurrencesRouter from "./routes/occurrences.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.PORT_APP || 3000;

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: "*", // 🔐 pode restringir depois ao domínio do frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rota principal
app.get("/", (req, res) => {
  res.send("🚔 API ROTAM Backend funcionando!");
});

/*
  ENDPOINTS DE SETUP / AUXILIARES
  - São úteis para configuração inicial. Remova/proteja depois.
*/

// 1) Cria a tabela users (se não existir) — campos básicos
app.get("/setup-users-table", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,     -- UNIQUE aqui é seguro; se sua UI já criou outra coluna, ok
        password_hash TEXT,
        role TEXT DEFAULT 'user',
        name TEXT,
        phone TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    return res.send("✅ Tabela 'users' verificada/criada com sucesso.");
  } catch (err) {
    console.error("Erro setup-users-table:", err);
    return res.status(500).send("Erro ao criar/verificar tabela users: " + err.message);
  }
});

// 2) Garante que exista um índice único em username (resolve erro ON CONFLICT)
app.get("/fix-users-unique", async (req, res) => {
  try {
    // cria índice único somente se não existir
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE schemaname = 'public' AND tablename = 'users' AND indexname = 'users_username_unique_idx'
        ) THEN
          CREATE UNIQUE INDEX users_username_unique_idx ON users (username);
        END IF;
      END
      $$;
    `);
    return res.send("✅ Índice único (username) verificado/criado com sucesso.");
  } catch (err) {
    console.error("Erro fix-users-unique:", err);
    return res.status(500).send("Erro ao criar índice único: " + err.message);
  }
});

// 3) Cria usuário admin (usuário 'adm' senha 'adm') — usa bcrypt para hash
//    Nota: faz INSERT simples; se usuário já existir, retorna mensagem informando.
app.get("/create-admin", async (req, res) => {
  try {
    const username = "adm";
    const password = "adm";

    // Verifica se já existe
    const { rows } = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (rows && rows.length > 0) {
      return res.send("ℹ️ Usuário 'adm' já existe. Nada a fazer.");
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (username, password_hash, role, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [username, hash, "admin"]
    );

    return res.send("✅ Usuário admin criado com sucesso (adm/adm).");
  } catch (err) {
    console.error("Erro create-admin:", err);
    return res.status(500).send("Erro ao criar usuário admin: " + (err.message || err));
  }
});

/*
  AUTENTICAÇÃO SIMPLES (sem JWT) — retorna apenas info básica do usuário
  Frontend pode armazenar o objeto user em localStorage enquanto houver sessão.
*/
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

    const user = rows && rows[0];
    if (!user) return res.status(401).json({ error: "Credenciais inválidas." });

    const ok = await bcrypt.compare(password, user.password_hash || "");
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas." });

    // sem JWT por enquanto
    return res.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Erro /auth/login:", err);
    return res.status(500).json({ error: "Erro interno no login", detail: err.message });
  }
});

// Rotas de ocorrências (seu router existente)
app.use("/occurrences", occurrencesRouter);

// Start
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
