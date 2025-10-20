import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  let client;
  try {
    client = await pool.connect();
    console.log("🟢 Conectado ao banco com sucesso!");

    await client.query(`
      CREATE TABLE IF NOT EXISTS efetivo (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        patente TEXT NOT NULL,
        funcao TEXT,
        setor TEXT,
        turno TEXT,
        viatura TEXT,
        placa TEXT,
        status TEXT DEFAULT 'Disponível',
        latitude NUMERIC(9,6),
        longitude NUMERIC(9,6),
        foto TEXT,
        atualizado_em TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS viaturas (
        id SERIAL PRIMARY KEY,
        prefixo TEXT UNIQUE NOT NULL,
        placa TEXT,
        modelo TEXT,
        status TEXT DEFAULT 'Disponível',
        localizacao TEXT,
        latitude NUMERIC(9,6),
        longitude NUMERIC(9,6),
        atualizado_em TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS occurrences (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT,
        data TIMESTAMPTZ DEFAULT NOW(),
        local TEXT,
        latitude NUMERIC(9,6),
        longitude NUMERIC(9,6),
        equipe_id INTEGER,
        equipe_nome TEXT,
        status TEXT DEFAULT 'Concluída',
        observacoes TEXT,
        registrado_por TEXT
      );
    `);

    console.log("✅ Tabelas criadas/verificadas com sucesso!");
    res.setHeader("Access-Control-Allow-Origin", "*");
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
