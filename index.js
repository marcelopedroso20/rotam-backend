// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import occurrencesRouter from "./routes/occurrences.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para aceitar JSON
app.use(express.json());

// Habilitar CORS para permitir requisições do frontend
app.use(cors({
  origin: "*", // 🔓 libera para qualquer origem (pode restringir depois para seu GitHub Pages)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

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
