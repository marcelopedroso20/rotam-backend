// routes/occurrences.js
import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM occurrences ORDER BY id DESC LIMIT 200");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar ocorrências" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { titulo, descricao, data, local, latitude, longitude, equipe_id, equipe_nome, status, observacoes, registrado_por } = req.body;
    const result = await pool.query(
      `INSERT INTO occurrences (titulo, descricao, data, local, latitude, longitude, equipe_id, equipe_nome, status, observacoes, registrado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [titulo, descricao, data, local, latitude, longitude, equipe_id, equipe_nome, status, observacoes, registrado_por]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar ocorrência" });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, data, local, latitude, longitude, equipe_id, equipe_nome, status, observacoes, registrado_por } = req.body;
    const result = await pool.query(
      `UPDATE occurrences SET
       titulo=$1, descricao=$2, data=$3, local=$4, latitude=$5, longitude=$6, equipe_id=$7, equipe_nome=$8,
       status=$9, observacoes=$10, registrado_por=$11
       WHERE id=$12 RETURNING *`,
      [titulo, descricao, data, local, latitude, longitude, equipe_id, equipe_nome, status, observacoes, registrado_por, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Ocorrência não encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar ocorrência" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM occurrences WHERE id=$1 RETURNING *", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Ocorrência não encontrada" });
    res.json({ message: "Ocorrência excluída com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir ocorrência" });
  }
});

export default router;
