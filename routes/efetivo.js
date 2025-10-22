// routes/efetivo.js
import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM efetivo ORDER BY id ASC");
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { nome, patente, funcao, setor, turno, viatura, placa, status, latitude, longitude, foto } = req.body;
    if (!nome || !patente) return res.status(400).json({ error: "Campos obrigatórios: nome, patente" });
    const { rows } = await pool.query(
      `INSERT INTO efetivo (nome, patente, funcao, setor, turno, viatura, placa, status, latitude, longitude, foto)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [nome, patente, funcao, setor, turno, viatura, placa, status, latitude, longitude, foto]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, patente, funcao, setor, turno, viatura, placa, status, latitude, longitude, foto } = req.body;
    const { rows, rowCount } = await pool.query(
      `UPDATE efetivo SET
        nome=$1, patente=$2, funcao=$3, setor=$4, turno=$5, viatura=$6, placa=$7, status=$8,
        latitude=$9, longitude=$10, foto=$11, atualizado_em=NOW()
       WHERE id=$12 RETURNING *`,
      [nome, patente, funcao, setor, turno, viatura, placa, status, latitude, longitude, foto, id]
    );
    if (rowCount === 0) return res.status(404).json({ error: "Registro não encontrado" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query("DELETE FROM efetivo WHERE id=$1 RETURNING *", [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Registro não encontrado" });
    res.json({ message: "Excluído com sucesso" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
