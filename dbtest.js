// routes/dbtest.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    console.log("🟢 Conectado ao banco de dados (teste)");
    
    // Testa a query mais simples possível
    const result = await client.query("SELECT NOW() as data_atual");
    console.log("📅 Data do servidor PostgreSQL:", result.rows[0].data_atual);

    // Lista todas as tabelas públicas
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);

    res.json({
      success: true,
      message: "Conexão ao banco bem-sucedida!",
      data_atual: result.rows[0].data_atual,
      tabelas: tables.rows.map(t => t.table_name),
    });

  } catch (err) {
    console.error("❌ Erro ao testar conexão:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (client) {
      client.release();
      console.log("🔵 Conexão liberada (teste).");
    }
  }
});

export default router;
