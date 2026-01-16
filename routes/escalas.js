// routes/escalas.js
// ===============================
// 📅 ROTAM - API de Escalas Diárias
// ===============================
import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===============================
// 📋 GET - Listar todas as escalas
// ===============================
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { data_inicio, data_fim, limit = 30 } = req.query;
    
    let query = `
      SELECT 
        e.*,
        cmd.nome as comandante_nome, cmd.patente as comandante_patente,
        fis.nome as fiscal_nome, fis.patente as fiscal_patente,
        adj.nome as adjunto_nome, adj.patente as adjunto_patente,
        ali.nome as chefe_ali_nome, ali.patente as chefe_ali_patente
      FROM escalas e
      LEFT JOIN efetivo cmd ON e.comandante_dia = cmd.id
      LEFT JOIN efetivo fis ON e.fiscal_dia = fis.id
      LEFT JOIN efetivo adj ON e.adjunto_dia = adj.id
      LEFT JOIN efetivo ali ON e.chefe_ali = ali.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (data_inicio) {
      query += ` AND e.data >= $${paramCount}`;
      params.push(data_inicio);
      paramCount++;
    }
    
    if (data_fim) {
      query += ` AND e.data <= $${paramCount}`;
      params.push(data_fim);
      paramCount++;
    }
    
    query += ` ORDER BY e.data DESC LIMIT $${paramCount}`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (e) {
    console.error("Erro ao listar escalas:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ===============================
// 📋 GET - Buscar escala específica por ID
// ===============================
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Busca dados principais da escala
    const escalaResult = await pool.query(`
      SELECT 
        e.*,
        cmd.nome as comandante_nome, cmd.patente as comandante_patente, cmd.rgpm as comandante_rgpm,
        fis.nome as fiscal_nome, fis.patente as fiscal_patente, fis.rgpm as fiscal_rgpm,
        adj.nome as adjunto_nome, adj.patente as adjunto_patente, adj.rgpm as adjunto_rgpm,
        ali.nome as chefe_ali_nome, ali.patente as chefe_ali_patente, ali.rgpm as chefe_ali_rgpm
      FROM escalas e
      LEFT JOIN efetivo cmd ON e.comandante_dia = cmd.id
      LEFT JOIN efetivo fis ON e.fiscal_dia = fis.id
      LEFT JOIN efetivo adj ON e.adjunto_dia = adj.id
      LEFT JOIN efetivo ali ON e.chefe_ali = ali.id
      WHERE e.id = $1
    `, [id]);
    
    if (escalaResult.rows.length === 0) {
      return res.status(404).json({ error: "Escala não encontrada" });
    }
    
    // Busca alocações da escala
    const alocacoesResult = await pool.query(`
      SELECT 
        a.*,
        ef.nome, ef.patente, ef.rgpm, ef.funcao
      FROM escala_alocacoes a
      LEFT JOIN efetivo ef ON a.efetivo_id = ef.id
      WHERE a.escala_id = $1
      ORDER BY a.tipo_alocacao, a.posicao
    `, [id]);
    
    const escala = escalaResult.rows[0];
    escala.alocacoes = alocacoesResult.rows;
    
    res.json(escala);
  } catch (e) {
    console.error("Erro ao buscar escala:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ===============================
// 📋 GET - Buscar escala por data
// ===============================
router.get("/data/:data", authenticateToken, async (req, res) => {
  try {
    const { data } = req.params;
    const { turno = 'Diurno' } = req.query;
    
    const escalaResult = await pool.query(`
      SELECT 
        e.*,
        cmd.nome as comandante_nome, cmd.patente as comandante_patente, cmd.rgpm as comandante_rgpm,
        fis.nome as fiscal_nome, fis.patente as fiscal_patente, fis.rgpm as fiscal_rgpm,
        adj.nome as adjunto_nome, adj.patente as adjunto_patente, adj.rgpm as adjunto_rgpm,
        ali.nome as chefe_ali_nome, ali.patente as chefe_ali_patente, ali.rgpm as chefe_ali_rgpm
      FROM escalas e
      LEFT JOIN efetivo cmd ON e.comandante_dia = cmd.id
      LEFT JOIN efetivo fis ON e.fiscal_dia = fis.id
      LEFT JOIN efetivo adj ON e.adjunto_dia = adj.id
      LEFT JOIN efetivo ali ON e.chefe_ali = ali.id
      WHERE e.data = $1 AND e.turno = $2
    `, [data, turno]);
    
    if (escalaResult.rows.length === 0) {
      return res.json(null);
    }
    
    const escala = escalaResult.rows[0];
    
    // Busca alocações
    const alocacoesResult = await pool.query(`
      SELECT 
        a.*,
        ef.nome, ef.patente, ef.rgpm, ef.funcao
      FROM escala_alocacoes a
      LEFT JOIN efetivo ef ON a.efetivo_id = ef.id
      WHERE a.escala_id = $1
      ORDER BY a.tipo_alocacao, a.posicao
    `, [escala.id]);
    
    escala.alocacoes = alocacoesResult.rows;
    
    res.json(escala);
  } catch (e) {
    console.error("Erro ao buscar escala por data:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ===============================
// ➕ POST - Criar nova escala
// ===============================
router.post("/", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      data,
      turno = 'Diurno',
      comandante_dia,
      fiscal_dia,
      adjunto_dia,
      chefe_ali,
      observacoes,
      alocacoes = []
    } = req.body;
    
    // Validação
    if (!data) {
      return res.status(400).json({ error: "Data é obrigatória" });
    }
    
    // Insere escala principal
    const escalaResult = await client.query(`
      INSERT INTO escalas (
        data, turno, comandante_dia, fiscal_dia, adjunto_dia, chefe_ali, 
        observacoes, criado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data, turno, comandante_dia, fiscal_dia, adjunto_dia, chefe_ali,
      observacoes, req.user.usuario
    ]);
    
    const escala = escalaResult.rows[0];
    
    // Insere alocações
    if (alocacoes.length > 0) {
      for (const aloc of alocacoes) {
        await client.query(`
          INSERT INTO escala_alocacoes (
            escala_id, efetivo_id, tipo_alocacao, viatura, posicao,
            horario_inicio, horario_fim, observacoes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          escala.id,
          aloc.efetivo_id,
          aloc.tipo_alocacao,
          aloc.viatura || null,
          aloc.posicao || null,
          aloc.horario_inicio || null,
          aloc.horario_fim || null,
          aloc.observacoes || null
        ]);
      }
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      success: true, 
      escala_id: escala.id,
      message: "Escala criada com sucesso" 
    });
    
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("Erro ao criar escala:", e.message);
    
    if (e.code === '23505') { // Duplicate key
      return res.status(409).json({ error: "Já existe uma escala para esta data e turno" });
    }
    
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ===============================
// ✏️ PUT - Atualizar escala
// ===============================
router.put("/:id", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const {
      data,
      turno,
      comandante_dia,
      fiscal_dia,
      adjunto_dia,
      chefe_ali,
      observacoes,
      alocacoes = []
    } = req.body;
    
    // Atualiza escala principal
    const result = await client.query(`
      UPDATE escalas SET
        data = $1,
        turno = $2,
        comandante_dia = $3,
        fiscal_dia = $4,
        adjunto_dia = $5,
        chefe_ali = $6,
        observacoes = $7,
        atualizado_em = NOW()
      WHERE id = $8
      RETURNING *
    `, [data, turno, comandante_dia, fiscal_dia, adjunto_dia, chefe_ali, observacoes, id]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Escala não encontrada" });
    }
    
    // Remove alocações antigas
    await client.query('DELETE FROM escala_alocacoes WHERE escala_id = $1', [id]);
    
    // Insere novas alocações
    if (alocacoes.length > 0) {
      for (const aloc of alocacoes) {
        await client.query(`
          INSERT INTO escala_alocacoes (
            escala_id, efetivo_id, tipo_alocacao, viatura, posicao,
            horario_inicio, horario_fim, observacoes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          id,
          aloc.efetivo_id,
          aloc.tipo_alocacao,
          aloc.viatura || null,
          aloc.posicao || null,
          aloc.horario_inicio || null,
          aloc.horario_fim || null,
          aloc.observacoes || null
        ]);
      }
    }
    
    await client.query('COMMIT');
    
    res.json({ success: true, message: "Escala atualizada com sucesso" });
    
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("Erro ao atualizar escala:", e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ===============================
// 🗑️ DELETE - Excluir escala
// ===============================
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM escalas WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Escala não encontrada" });
    }
    
    res.json({ success: true, message: "Escala excluída com sucesso" });
    
  } catch (e) {
    console.error("Erro ao excluir escala:", e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
