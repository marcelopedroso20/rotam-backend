import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import occurrencesRouter from "./routes/occurrences.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// rota de status
app.get("/", (req, res) => {
  res.send("🚔 API ROTAM Backend funcionando!");
});

// rota de teste com o banco (você já usou ontem)
app.get("/teste-banco", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW()");
    res.json({ message: "Banco conectado com sucesso!", hora: { agora: r.rows[0].now } });
  } catch (e) {
    console.error(e);
    res.status(500).send("Erro ao conectar no banco");
  }
});

// 👉 aqui plugamos as rotas de ocorrências
app.use("/occurrences", occurrencesRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
