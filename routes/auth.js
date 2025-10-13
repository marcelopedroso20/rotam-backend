// routes/auth.js
import { Router } from "express";
import pkg from "pg";
const { Pool } = pkg;

const router = Router();

// 🔑 Conexão com o banco PostgreSQL (Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 🔒 POST /auth/login — valida login no banco
router.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ success: false, error: "Usuário e senha são obrigatórios" });
    }

    // Consulta simples (sem bcrypt)
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE usuario = $1 AND senha = $2",
      [usuario, senha]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ success: false, error: "Usuário ou senha inválidos" });
    }

    const user = result.rows[0];

    // Resposta simples (sem JWT)
    res.json({
      success: true,
      message: "Login bem-sucedido!",
      user: { id: user.id, usuario: user.usuario }
    });
  } catch (err) {
    console.error("❌ Erro no login:", err);
    res.status(500).json({ success: false, error: "Erro interno no login" });
  }
});

export default router;
