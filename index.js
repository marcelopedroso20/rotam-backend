// Criar nova ocorrência
app.post("/occurrences", async (req, res) => {
  try {
    const {
      reporter_id,
      reporter_name,
      comunicante_nome,
      comunicante_rg,
      comunicante_cpf,
      comunicante_endere,
      comunicante_telefor,
      occurred_at,
      occurred_location,
      occurrence_type,
      description,
      involved,
      measures_taken,
      signature,
      attachments,
      status
    } = req.body;

    const result = await pool.query(
      `INSERT INTO occurrences (
        reporter_id, reporter_name, comunicante_nome, comunicante_rg, comunicante_cpf, comunicante_endere,
        comunicante_telefor, occurred_at, occurred_location, occurrence_type, description,
        involved, measures_taken, signature, attachments, status, created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),NOW()
      ) RETURNING *`,
      [
        reporter_id, reporter_name, comunicante_nome, comunicante_rg, comunicante_cpf, comunicante_endere,
        comunicante_telefor, occurred_at, occurred_location, occurrence_type, description,
        involved, measures_taken, signature, attachments, status
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar ocorrência" });
  }
});
