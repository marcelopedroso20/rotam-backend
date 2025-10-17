import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    console.log("🟢 Conectado ao banco com sucesso!");

    await client.query(`
      CREATE TABLE IF NOT EXISTS efetivo (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100),
        patente VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS viaturas (
        id SERIAL PRIMARY KEY,
        modelo VARCHAR(100),
        placa VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ocorrencias (
        id SERIAL PRIMARY KEY,
        descricao TEXT,
        data TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Tabelas criadas/verificadas com sucesso!");
    res.json({ success: true, message: "Banco de dados sincronizado com sucesso!" });
  } catch (err) {
    console.error("❌ Erro ao configurar o banco:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (client) {
      client.release();
      console.log("🔵 Conexão liberada.");
    }
  }
});

export default router;
