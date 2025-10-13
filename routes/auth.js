// routes/auth.js
import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const router = express.Router();

// 🧩 Conexão com o banco PostgreSQL (Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 🔐 Rota de login
router.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({
        success: false,
        error: "Usuário e senha são obrigatórios.",
      });
    }

    // Busca o usuário no banco
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE usuario = $1 AND senha = $2",
      [usuario, senha]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        error: "Usuário ou senha inválidos.",
      });
    }

    const user = result.rows[0];

    // Retorna sucesso (sem JWT, apenas validação direta)
    return res.json({
      success: true,
      message: "Login realizado com sucesso!",
      user: {
        id: user.id,
        usuario: user.usuario,
      },
    });
  } catch (error) {
    console.error("❌ Erro no login:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno no servidor durante o login.",
    });
  }
});

export default router;
