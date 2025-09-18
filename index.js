import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 8080;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Railway exige SSL
});

app.use(cors());
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("🚔 API ROTAM Backend funcionando!");
});

// Rota para listar ocorrências
app.get("/occurrences", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM occurrences ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar ocorrências" });
  }
});

// Rota para criar ocorrência
app.post("/occurrences", async (req, res) => {
  try {
    const {
      reporter_id,
      reporter_name,
      comunicante_nome,
      comunicante_rg,
      comunicante_cpf,
      comunicante_endere,
      comunicante_telefor,
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

    const result = await pool.query(
      `INSERT INTO occurrences (
        reporter_id, reporter_name, comunicante_nome, comunicante_rg, comunicante_cpf, comunicante_endere,
        comunicante_telefor, occurred_at, occurred_location, occurrence_type, description,
        involved, measures_taken, signature, attachments, status, created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),NOW()
      ) RETURNING *`,
      [
        reporter_id, reporter_name, comunicante_nome, comunicante_rg, comunicante_cpf, comunicante_endere,
        comunicante_telefor, occurred_at, occurred_location, occurrence_type, description,
        involved, measures_taken, signature, attachments, status
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar ocorrência" });
  }
});

// Subir servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
