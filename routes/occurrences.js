// routes/occurrences.js
import { Router } from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM occurrences ORDER BY id DESC LIMIT 100"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar ocorrências" });
  }
});

// ... resto do código POST, PUT, DELETE permanece igual
export default router;
