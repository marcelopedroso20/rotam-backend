// routes/setup-db.js
import express from "express";
import pool from "../db.js"; // importa a conexão existente

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Testa conexão
    const client = await pool.connect();

    // Cria tabelas principais se não existirem
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        usuario VARCHAR(50) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        perfil VARCHAR(50) DEFAULT 'operador',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS efetivo (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        patente VARCHAR(50),
        matricula VARCHAR(30),
        ativo BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS viaturas (
        id SERIAL PRIMARY KEY,
        prefixo VARCHAR(20) UNIQUE,
        modelo VARCHAR(50),
        placa VARCHAR(20),
        ativo BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ocorrencias (
        id SERIAL PRIMARY KEY,
        descricao TEXT,
        data_ocorrencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responsavel VARCHAR(100),
        status VARCHAR(30) DEFAULT 'Em andamento'
      );
    `);

    client.release();
    res.json({ success: true, message: "Banco de dados sincronizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao configurar o banco:", error);
    res.json({ success: false, error: error.message });
  }
});

export default router;
