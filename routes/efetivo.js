import express from "express";
import db from "../db.js"; // importa a conexão com o Postgres

const router = express.Router();

// ➕ Adicionar militar
router.post("/", async (req, res) => {
  try {
    const { nome, patente, funcao, setor, foto } = req.body;
    await db.query(
      "INSERT INTO efetivo (nome, patente, funcao, setor, foto) VALUES ($1,$2,$3,$4,$5)",
      [nome, patente, funcao, setor, foto]
    );
    res.json({ success: true, message: "Militar adicionado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar militar" });
  }
});

// 📋 Listar todos os militares
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM efetivo ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar efetivo" });
  }
});

export default router;
