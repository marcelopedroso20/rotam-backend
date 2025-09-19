// routes/occurrences.js
import { Router } from "express";
import pool from "../db.js";

const router = Router();

/**
 * GET /occurrences
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM occurrences ORDER BY id DESC LIMIT 100"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar ocorrências" });
  }
});

/**
 * POST /occurrences
 */
router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const today = new Date().toISOString().slice(0, 10);

    const data = {
      reporter_id: body.reporter_id ?? null,
      reporter_name: body.reporter_name ?? null,
      comunicante_nome: body.comunicante_nome ?? null,
      comunicante_rg: body.comunicante_rg ?? null,
      comunicante_cpf: body.comunicante_cpf ?? null,
      comunicante_ender: body.comunicante_ender ?? null,
      comunicante_telefor: body.comunicante_telefor ?? null,
      occurred_at: body.occurred_at ?? today,
      occurred_location: body.occurred_location ?? "",
      occurrence_type: body.occurrence_type ?? "",
      description: body.description ?? "",
      involved: body.involved ?? [],
      measures_taken: body.measures_taken ?? "",
      signature: body.signature ?? "",
      attachments: body.attachments ?? [],
      status: body.status ?? "aberta",
      created_at: today,
      updated_at: today,
    };

    const sql = `
      INSERT INTO occurrences
      (reporter_id, reporter_name,
       comunicante_nome, comunicante_rg, comunicante_cpf,
       comunicante_ender, comunicante_telefor,
       occurred_at, occurred_location, occurrence_type,
       description, involved, measures_taken, signature,
       attachments, status, created_at, updated_at)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING id
    `;

    const params = [
      data.reporter_id,
      data.reporter_name,
      data.comunicante_nome,
      data.comunicante_rg,
      data.comunicante_cpf,
      data.comunicante_ender,
      data.comunicante_telefor,
      data.occurred_at,
      data.occurred_location,
      data.occurrence_type,
      data.description,
      JSON.stringify(data.involved),
      data.measures_taken,
      data.signature,
      JSON.stringify(data.attachments),
      data.status,
      data.created_at,
      data.updated_at,
    ];

    const result = await pool.query(sql, params);
    res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar ocorrência", detail: err.message });
  }
});

/**
 * PUT /occurrences/:id
 * Atualiza uma ocorrência existente
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const updated_at = new Date().toISOString().slice(0, 10);

    const sql = `
      UPDATE occurrences
      SET reporter_id=$1, reporter_name=$2, comunicante_nome=$3, comunicante_rg=$4,
          comunicante_cpf=$5, comunicante_ender=$6, comunicante_telefor=$7,
          occurred_at=$8, occurred_location=$9, occurrence_type=$10,
          description=$11, involved=$12, measures_taken=$13,
          signature=$14, attachments=$15, status=$16, updated_at=$17
      WHERE id=$18 RETURNING *
    `;

    const params = [
      body.reporter_id ?? null,
      body.reporter_name ?? null,
      body.comunicante_nome ?? null,
      body.comunicante_rg ?? null,
      body.comunicante_cpf ?? null,
      body.comunicante_ender ?? null,
      body.comunicante_telefor ?? null,
      body.occurred_at ?? null,
      body.occurred_location ?? "",
      body.occurrence_type ?? "",
      body.description ?? "",
      JSON.stringify(body.involved ?? []),
      body.measures_taken ?? "",
      body.signature ?? "",
      JSON.stringify(body.attachments ?? []),
      body.status ?? "aberta",
      updated_at,
      id,
    ];

    const result = await pool.query(sql, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ocorrência não encontrada" });
    }
    res.json({ success: true, occurrence: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar ocorrência", detail: err.message });
  }
});

/**
 * DELETE /occurrences/:id
 * Remove uma ocorrência pelo ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM occurrences WHERE id=$1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ocorrência não encontrada" });
    }
    res.json({ success: true, deletedId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar ocorrência", detail: err.message });
  }
});

export default router;
