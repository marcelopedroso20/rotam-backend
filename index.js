// index.js
import express from "express";
import dotenv from "dotenv";
import occurrencesRouter from "./routes/occurrences.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para aceitar JSON
app.use(express.json());

// Rota principal
app.get("/", (req, res) => {
  res.send("🚔 API ROTAM Backend funcionando!");
});

// Rotas de ocorrências
app.use("/occurrences", occurrencesRouter);

// Start
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
