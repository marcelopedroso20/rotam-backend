import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const router = express.Router();

// 🧱 Conexão com o banco PostgreSQL do Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Rota GET - Buscar todos os registros do efetivo
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM efetivo ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar efetivo:", error);
    res.status(500).json({ error: "Erro ao buscar dados do efetivo." });
  }
});

// ✅ Rota POST - Adicionar um novo militar
router.post("/", async (req, res) => {
  try {
    const { nome, patente, funcao, setor, foto } = req.body;

    if (!nome || !patente || !funcao || !setor) {
      return res.status(400).json({ error: "Campos obrigatórios não preenchidos." });
    }

    const result = await pool.query(
      "INSERT INTO efetivo (nome, patente, funcao, setor, foto) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nome, patente, funcao, setor, foto]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao adicionar militar:", error);
    res.status(500).json({ error: "Erro ao adicionar militar." });
  }
});

// ✅ Rota DELETE - Excluir militar pelo ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM efetivo WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Militar não encontrado." });
    }

    res.json({ message: "Militar excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir militar:", error);
    res.status(500).json({ error: "Erro ao excluir militar." });
  }
});

export default router;
