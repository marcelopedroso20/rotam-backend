import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json()); // importante para ler JSON do corpo da requisição

// Conexão com Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ========================
// ROTA TESTE API
// ========================
app.get("/", (req, res) => {
  res.send("🚓 API ROTAM Backend funcionando!");
});

// ========================
// ROTA: LISTAR OCORRÊNCIAS
// ========================
app.get("/occurrences", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM occurrences ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar ocorrências" });
  }
});

// ========================
// ROTA: INSERIR OCORRÊNCIA
// ========================
app.post("/occurrences", async (req, res) => {
  try {
    const {
      reporter_id,
      reporter_name,
      comunicante_nome,
      comunicante_rg,
      comunicante_cpf,
      comunicante_endereco,
      comunicante_telefone,
      occurred_at,
      occurred_location,
      occurrence_type,
      description,
      involved,
      measures_taken,
      signature,
      attachments,
      status
    } = req.body;

    const query = `
      INSERT INTO occurrences (
        reporter_id, reporter_name, comunicante_nome, comunicante_rg, comunicante_cpf,
        comunicante_endereco, comunicante_telefone, occurred_at, occurred_location,
        occurrence_type, description, involved, measures_taken, signature, attachments, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
      ) RETURNING *;
    `;

    const values = [
      reporter_id,
      reporter_name,
      comunicante_nome,
      comunicante_rg,
      comunicante_cpf,
      comunicante_endereco,
      comunicante_telefone,
      occurred_at,
      occurred_location,
      occurrence_type,
      description,
      involved,
      measures_taken,
      signature,
      attachments, // precisa vir como JSON válido → [] ou [{ "arquivo": "foto1.png" }]
      status
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // retorna o registro inserido
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao inserir ocorrência" });
  }
});

// ========================
// INICIAR SERVIDOR
// ========================
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
