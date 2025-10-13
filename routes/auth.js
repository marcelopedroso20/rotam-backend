// routes/auth.js
import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const router = express.Router();

// 🔑 Conexão com PostgreSQL (Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 🔐 POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({
        success: false,
        error: "Usuário e senha obrigatórios",
      });
    }

    const query = "SELECT * FROM usuarios WHERE usuario = $1 AND senha = $2";
    const result = await pool.query(query, [usuario, senha]);

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        error: "Usuário ou senha inválidos",
      });
    }

    const user = result.rows[0];

    return res.json({
      success: true,
      message: "Login realizado com sucesso!",
      usuario: user.usuario,
    });
  } catch (error) {
    console.error("❌ Erro no login:", error.message);
    res.status(500).json({
      success: false,
      error: "Erro interno no servidor: " + error.message,
    });
  }
});

export default router;
