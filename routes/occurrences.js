// routes/occurrences.js
import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ GET - lista últimas 100 ocorrências
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM occurrences ORDER BY id DESC LIMIT 100");
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar ocorrências:", err.message);
    res.status(500).json({ error: "Erro ao buscar ocorrências" });
  }
});

// ✅ POST - cria
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { titulo, descricao, data, local, equipe, observacoes } = req.body;
    const result = await pool.query(
      `INSERT INTO occurrences (titulo, descricao, data, local, equipe, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [titulo, descricao, data, local, equipe, observacoes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar ocorrência:", err.message);
    res.status(500).json({ error: "Erro ao criar ocorrência" });
  }
});

// ✅ PUT - atualiza
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, data, local, equipe, observacoes } = req.body;
    const result = await pool.query(
      `UPDATE occurrences
       SET titulo=$1, descricao=$2, data=$3, local=$4, equipe=$5, observacoes=$6
       WHERE id=$7 RETURNING *`,
      [titulo, descricao, data, local, equipe, observacoes, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Ocorrência não encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar ocorrência:", err.message);
    res.status(500).json({ error: "Erro ao atualizar ocorrência" });
  }
});

// ✅ DELETE - remove
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM occurrences WHERE id=$1 RETURNING *", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Ocorrência não encontrada" });
    res.json({ message: "Ocorrência excluída com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir ocorrência:", err.message);
    res.status(500).json({ error: "Erro ao excluir ocorrência" });
  }
});

export default router;
