// routes/occurrences.js
import { Router } from "express";
import pool from "../db.js";

const router = Router();

/**
 * GET /occurrences
 * Lista até 100 ocorrências
 */
router.get("/", async (req, res) => {
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

/**
 * POST /occurrences
 * Cria uma nova ocorrência
 */
router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

    const data = {
      reporter_id: body.reporter_id ?? null,
      reporter_name: body.reporter_name ?? null,
      comunicante_nome: body.comunicante_nome ?? null,
      comunicante_rg: body.comunicante_rg ?? null,
      comunicante_cpf: body.comunicante_cpf ?? null,
      comunicante_endereco: body.comunicante_endereco ?? null,
      comunicante_telefone: body.comunicante_telefone ?? null,
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
       comunicante_endereco, comunicante_telefone,
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
      data.comunicante_endereco,
      data.comunicante_telefone,
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
    console.error(err);
    res.status(500).json({ error: "Erro ao criar ocorrência", detail: err.message });
  }
});

export default router;
