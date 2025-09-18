import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js"; // importa a conexão com o banco

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de teste da API
app.get("/", (req, res) => {
  res.send("🚔 API ROTAM Backend funcionando!");
});

// Rota de teste do banco
app.get("/teste-banco", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()"); // pega a hora atual do banco
    res.json({ message: "Banco conectado com sucesso!", hora: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao conectar no banco");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
