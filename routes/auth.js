// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_forte";

// 🔐 POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) {
      return res.status(400).json({ success: false, error: "Usuário e senha obrigatórios" });
    }

    const { rows } = await pool.query("SELECT * FROM usuarios WHERE usuario = $1", [usuario]);
    const user = rows[0];
    if (!user) return res.status(401).json({ success: false, error: "Usuário ou senha inválidos" });

    const ok = await bcrypt.compare(senha, user.senha_hash);
    if (!ok) return res.status(401).json({ success: false, error: "Usuário ou senha inválidos" });

    const token = jwt.sign(
      { id: user.id, usuario: user.usuario, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ success: true, message: "Login realizado com sucesso!", token });
  } catch (error) {
    console.error("❌ Erro no login:", error.message);
    res.status(500).json({ success: false, error: "Erro interno no servidor" });
  }
});

export default router;
