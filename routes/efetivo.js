import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const router = express.Router();

// 🔗 Conexão com o PostgreSQL (Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // variável de ambiente do Railway
  ssl: { rejectUnauthorized: false }
});

// 🔸 GET - listar todos
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM efetivo ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});

// 🔸 POST - cadastrar novo militar
router.post("/", async (req, res) => {
  try {
    const { nome, patente, funcao, setor, foto } = req.body;
    const result = await pool.query(
      "INSERT INTO efetivo (nome, patente, funcao, setor, foto) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nome, patente, funcao, setor, foto]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao inserir dado" });
  }
});

export default router;
