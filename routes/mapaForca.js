// ===============================
// 🗺️ ROTAM - Rotas do Mapa da Força (v1.0)
// ===============================
import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ====================================
// 🔐 Middleware de autenticação JWT
// ====================================
function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token não fornecido." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido." });
    req.user = user;
    next();
  });
}

// ====================================
// 📍 GET /api/mapa?data=YYYY-MM-DD&turno=Turno
// Retorna todos os postos + efetivo alocado (se existir)
// ====================================
router.get("/", autenticarToken, async (req, res) => {
  try {
    const { data, turno } = req.query;

    // Busca todos os postos ativos
    const { rows: postos } = await pool.query(
      `SELECT id AS posto_id, setor, nome_posto, ordem FROM postos WHERE ativo = true ORDER BY setor, ordem`
    );

    if (!data || !turno) {
      // Se não foi informada data/turno, apenas retorna estrutura base
      return res.json(postos.map(p => ({ ...p, efetivo_id: null })));
    }

    // Busca se existe escala registrada para a data/turno
    const escalaDia = await pool.query(
      `SELECT id FROM escala_dia WHERE data = $1 AND turno = $2`,
      [data, turno]
    );

    if (escalaDia.rowCount === 0) {
      // Nenhuma escala criada para essa data/turno
      return res.json(postos.map(p => ({ ...p, efetivo_id: null })));
    }

    const escalaId = escalaDia.rows[0].id;

    // Junta escala_item com os postos
    const { rows: escala } = await pool.query(
      `
      SELECT 
        p.id AS posto_id,
        p.setor,
        p.nome_posto,
        p.ordem,
        e.efetivo_id
      FROM postos p
      LEFT JOIN escala_item e 
        ON p.id = e.posto_id AND e.escala_id = $1
      WHERE p.ativo = true
      ORDER BY p.setor, p.ordem
      `,
      [escalaId]
    );

    res.json(escala);
  } catch (err) {
    console.error("Erro ao buscar mapa:", err);
    res.status(500).json({ error: "Erro ao carregar o mapa da força." });
  }
});

// ====================================
// 💾 POST /api/mapa/salvar
// Cria ou atualiza a escala do dia
// ====================================
router.post("/salvar", autenticarToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { data, turno, alocacoes } = req.body;

    if (!data || !turno || !Array.isArray(alocacoes)) {
      return res.status(400).json({ error: "Dados inválidos." });
    }

    await client.query("BEGIN");

    // 1️⃣ Garante que exista a escala_dia
    const escalaRes = await client.query(
      `
      INSERT INTO escala_dia (data, turno)
      VALUES ($1, $2)
      ON CONFLICT (data, turno)
      DO UPDATE SET data = EXCLUDED.data
      RETURNING id;
      `,
      [data, turno]
    );
    const escalaId = escalaRes.rows[0].id;

    // 2️⃣ Remove alocações anteriores (limpa os postos daquele dia/turno)
    await client.query("DELETE FROM escala_item WHERE escala_id = $1", [escalaId]);

    // 3️⃣ Insere novas alocações
    for (const a of alocacoes) {
      await client.query(
        `
        INSERT INTO escala_item (escala_id, posto_id, efetivo_id)
        VALUES ($1, $2, $3)
        `,
        [escalaId, a.posto_id, a.efetivo_id]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Escala salva com sucesso." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro ao salvar escala:", err);
    res.status(500).json({ error: "Erro ao salvar escala no banco de dados." });
  } finally {
    client.release();
  }
});

export default router;
