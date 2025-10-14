// routes/efetivo.js
import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ GET - Lista todos
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM efetivo ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar efetivo:", error.message);
    res.status(500).json({ error: "Erro ao buscar dados do efetivo." });
  }
});

// ✅ POST - Cria novo
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { nome, patente, funcao, setor, foto } = req.body;
    if (!nome || !patente || !funcao || !setor) {
      return res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
    }
    const result = await pool.query(
      "INSERT INTO efetivo (nome, patente, funcao, setor, foto) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nome, patente, funcao, setor, foto]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao adicionar militar:", error.message);
    res.status(500).json({ error: "Erro ao adicionar militar." });
  }
});

// ✅ DELETE - Remove por ID
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM efetivo WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Militar não encontrado." });
    res.json({ message: "Militar excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir militar:", error.message);
    res.status(500).json({ error: "Erro ao excluir militar." });
  }
});

export default router;
