// ===============================
// 🗺️ ROTAM - Mapa da Força (API)
// ===============================
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

// 🔹 Lista de setores, postos e militares alocados no dia
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id AS posto_id,
        p.setor,
        p.nome_posto,
        e.id AS escala_id,
        ed.id AS efetivo_id,
        ed.nome AS efetivo_nome,
        ed.patente AS efetivo_patente
      FROM postos p
      LEFT JOIN escala_item ei ON ei.posto_id = p.id
      LEFT JOIN escala_dia e ON ei.escala_id = e.id
      LEFT JOIN efetivo ed ON ei.efetivo_id = ed.id
      ORDER BY p.setor, p.ordem
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar mapa da força:", err);
    res.status(500).json({ error: "Erro ao buscar dados do mapa" });
  }
});

// 🔹 Salva ou atualiza escala do dia
router.post("/salvar", authMiddleware, async (req, res) => {
  try {
    const { data, turno, alocacoes } = req.body;

    // 1️⃣ Cria ou localiza a escala do dia
    const escalaDia = await pool.query(
      `INSERT INTO escala_dia (data, turno)
       VALUES ($1, $2)
       ON CONFLICT (data, turno) DO UPDATE SET turno = EXCLUDED.turno
       RETURNING id`,
      [data, turno]
    );

    const escalaId = escalaDia.rows[0].id;

    // 2️⃣ Limpa alocações anteriores
    await pool.query("DELETE FROM escala_item WHERE escala_id = $1", [escalaId]);

    // 3️⃣ Insere novas alocações
    for (const item of alocacoes) {
      await pool.query(
        `INSERT INTO escala_item (escala_id, posto_id, efetivo_id, observacao)
         VALUES ($1, $2, $3, $4)`,
        [escalaId, item.posto_id, item.efetivo_id, item.observacao || null]
      );
    }

    res.json({ success: true, message: "Escala salva com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar escala:", err);
    res.status(500).json({ error: "Erro ao salvar escala" });
  }
});

module.exports = router;
