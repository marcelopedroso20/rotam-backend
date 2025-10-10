import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const router = express.Router();

// 🔗 Conexão com PostgreSQL do Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 📋 GET - listar efetivo
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM efetivo ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar efetivo:", err);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});

// ➕ POST - adicionar militar
router.post("/", async (req, res) => {
  try {
    const { nome, patente, funcao, setor, foto } = req.body;
    const result = await pool.query(
      "INSERT INTO efetivo (nome, patente, funcao, setor, foto) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nome, patente, funcao, setor, foto]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao inserir efetivo:", err);
    res.status(500).json({ error: "Erro ao inserir dado" });
  }
});

export default router;
