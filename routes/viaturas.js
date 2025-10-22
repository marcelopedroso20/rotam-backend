// routes/viaturas.js
import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM viaturas ORDER BY id ASC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { prefixo, placa, modelo, status, localizacao, latitude, longitude } = req.body;
    if (!prefixo) return res.status(400).json({ error: "Campo obrigatório: prefixo" });
    const { rows } = await pool.query(
      `INSERT INTO viaturas (prefixo, placa, modelo, status, localizacao, latitude, longitude)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [prefixo, placa, modelo, status, localizacao, latitude, longitude]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { prefixo, placa, modelo, status, localizacao, latitude, longitude } = req.body;
    const { rows, rowCount } = await pool.query(
      `UPDATE viaturas SET
        prefixo=$1, placa=$2, modelo=$3, status=$4, localizacao=$5, latitude=$6, longitude=$7, atualizado_em=NOW()
       WHERE id=$8 RETURNING *`,
      [prefixo, placa, modelo, status, localizacao, latitude, longitude, id]
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
    const r = await pool.query("DELETE FROM viaturas WHERE id=$1 RETURNING *", [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Registro não encontrado" });
    res.json({ message: "Excluído com sucesso" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
