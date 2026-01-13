// routes/efetivo.js
// ===============================
// 🪖 ROTAM - CRUD de Efetivo (v2.4.0)
// ✅ ATUALIZADO: Suporte ao campo nome_completo
// ===============================
import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===============================
// 📋 GET - Listar todos os efetivos
// ===============================
router.get("/", authenticateToken, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM efetivo ORDER BY id ASC");
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===============================
// ➕ POST - Cadastrar novo efetivo
// ✅ ATUALIZADO: Inclui nome_completo
// ===============================
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { 
      nome, 
      nome_completo,  // ✅ NOVO CAMPO
      patente, 
      funcao, 
      setor, 
      turno, 
      viatura, 
      placa, 
      status, 
      latitude, 
      longitude, 
      foto 
    } = req.body;

    // Validação básica
    if (!nome || !patente) {
      return res.status(400).json({ error: "Campos obrigatórios: nome, patente" });
    }

    const { rows } = await pool.query(
      `INSERT INTO efetivo (
        nome, 
        nome_completo,
        patente, 
        funcao, 
        setor, 
        turno, 
        viatura, 
        placa, 
        status, 
        latitude, 
        longitude, 
        foto
      )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) 
       RETURNING *`,
      [
        nome, 
        nome_completo || null,  // ✅ Permite NULL se não informado
        patente, 
        funcao, 
        setor, 
        turno, 
        viatura, 
        placa, 
        status, 
        latitude, 
        longitude, 
        foto
      ]
    );

    res.status(201).json(rows[0]);
  } catch (e) {
    console.error("Erro ao cadastrar efetivo:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ===============================
// ✏️ PUT - Atualizar efetivo
// ✅ ATUALIZADO: Inclui nome_completo
// ===============================
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nome, 
      nome_completo,  // ✅ NOVO CAMPO
      patente, 
      funcao, 
      setor, 
      turno, 
      viatura, 
      placa, 
      status, 
      latitude, 
      longitude, 
      foto 
    } = req.body;

    const { rows, rowCount } = await pool.query(
      `UPDATE efetivo SET
        nome=$1, 
        nome_completo=$2,
        patente=$3, 
        funcao=$4, 
        setor=$5, 
        turno=$6, 
        viatura=$7, 
        placa=$8, 
        status=$9,
        latitude=$10, 
        longitude=$11, 
        foto=$12, 
        atualizado_em=NOW()
       WHERE id=$13 
       RETURNING *`,
      [
        nome, 
        nome_completo || null,  // ✅ Permite NULL
        patente, 
        funcao, 
        setor, 
        turno, 
        viatura, 
        placa, 
        status, 
        latitude, 
        longitude, 
        foto, 
        id
      ]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }

    res.json(rows[0]);
  } catch (e) {
    console.error("Erro ao atualizar efetivo:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ===============================
// 🗑️ DELETE - Excluir efetivo
// ===============================
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query("DELETE FROM efetivo WHERE id=$1 RETURNING *", [id]);
    
    if (r.rowCount === 0) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }

    res.json({ message: "Excluído com sucesso" });
  } catch (e) {
    console.error("Erro ao excluir efetivo:", e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
