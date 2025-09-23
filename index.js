// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // <-- adicionado
import pool from "./db.js";
import occurrencesRouter from "./routes/occurrences.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "segredo_rotam";

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: "*", // pode restringir depois
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =====================
//  SETUP
// =====================

// 1) Cria tabela users
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
    res.send("✅ Tabela 'users' criada/verificada com sucesso.");
  } catch (e) {
    console.error("Erro ao criar tabela users:", e);
    res.status(500).send("Erro ao criar tabela users: " + e.message);
  }
});

// 2) Cria usuário admin (adm/adm)
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
      return res.send("ℹ️ Usuário 'adm' já existe.");
    }
    res.send("✅ Usuário admin criado com sucesso (adm/adm).");
  } catch (e) {
    res.status(500).send("Erro ao criar usuário admin: " + e.message);
  }
});

// =====================
//  LOGIN
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

    // Gera token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ error: "Erro interno no login", detail: e.message });
  }
});

// Middleware de autenticação (para proteger rotas)
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Token ausente." });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token inválido." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // anexar usuário
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token expirado ou inválido." });
  }
}

// =====================
//  ROTAS PROTEGIDAS
// =====================
app.use("/occurrences", authMiddleware, occurrencesRouter);

// Rota principal
app.get("/", (req, res) => {
  res.send("🚔 API ROTAM Backend funcionando!");
});

// Start
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
