// routes/efetivo.js
// ===============================
// 🪖 ROTAM - CRUD de Efetivo (v3.0.0 - COMPLETO)
// ✅ Todos os campos da planilha Excel
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
// ✅ COMPLETO: Todos os campos
// ===============================
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { 
      nome,              // Nome operacional curto (NOME IDENT.)
      nome_completo,     // Nome completo simples (NOME COMPLETO)
      nome_oficial,      // Nome completo com identificação (NOME COMPLETO COM IDENTIFICAÇÃO)
      patente,           // Posto/graduação (POSTO/GRAD)
      funcao,            // Função/situação (SITUAÇÃO)
      setor,             // Setor
      rgpm,              // Registro geral (RGPM)
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
        nome_oficial,
        patente, 
        funcao, 
        setor, 
        rgpm,
        turno, 
        viatura, 
        placa, 
        status, 
        latitude, 
        longitude, 
        foto
      )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) 
       RETURNING *`,
      [
        nome, 
        nome_completo || null,
        nome_oficial || null,
        patente, 
        funcao, 
        setor,
        rgpm || null,
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
// ✅ COMPLETO: Todos os campos
// ===============================
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nome, 
      nome_completo,
      nome_oficial,
      patente, 
      funcao, 
      setor,
      rgpm,
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
        nome_oficial=$3,
        patente=$4, 
        funcao=$5, 
        setor=$6,
        rgpm=$7,
        turno=$8, 
        viatura=$9, 
        placa=$10, 
        status=$11,
        latitude=$12, 
        longitude=$13, 
        foto=$14, 
        atualizado_em=NOW()
       WHERE id=$15 
       RETURNING *`,
      [
        nome, 
        nome_completo || null,
        nome_oficial || null,
        patente, 
        funcao, 
        setor,
        rgpm || null,
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
