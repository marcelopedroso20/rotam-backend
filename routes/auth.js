// routes/auth.js
import { Router } from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const SECRET = process.env.JWT_SECRET || "segredo123";

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE username=$1", [username]);

    if (result.rowCount === 0) {
      return res.status(401).json({ success: false, error: "Usuário não encontrado" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ success: false, error: "Senha incorreta" });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: "1h" });

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro no login" });
  }
});

export default router;
