// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";   // ⬅️ JWT
import pool from "./db.js";
import occurrencesRouter from "./routes/occurrences.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "segredo-super-seguro"; // coloque no .env depois

// ⬇️ Aqui você adiciona a linha da rota nova
import efetivoRoutes from "./routes/efetivo.js";
app.use("/api/efetivo", efetivoRoutes);

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: "*", // pode restringir depois para seu GitHub Pages
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rota principal
app.get("/", (req, res) => {
  res.send("🚔 API ROTAM Backend funcionando!");
});

// =====================
// SETUP (tabela users + admin)
// =====================
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
    res.status(500).send("❌ Erro ao criar tabela users: " + e.message);
  }
});

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
    res.send("✅ Usuário admin criado (adm/adm).");
  } catch (e) {
    res.status(500).send("❌ Erro ao criar admin: " + e.message);
  }
});

// =====================
// LOGIN (gera JWT)
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
    if (!user) return res.status(401).json({ error: "Credenciais inválidas." });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas." });

    // 🔑 Gera token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
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

// Middleware para validar token
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token ausente" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // dados do usuário ficam disponíveis
    next();
  } catch {
    return res.status(403).json({ error: "Token inválido ou expirado" });
  }
}

// =====================
// Rotas protegidas
// =====================
app.use("/occurrences", authMiddleware, occurrencesRouter);

// Start
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
