import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./db.js";
import occurrencesRouter from "./routes/occurrences.js";
import authRouter from "./routes/auth.js";
import { authenticateToken } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));

// Rota principal
app.get("/", (req, res) => {
  res.send("🚔 API ROTAM funcionando!");
});

// Rotas públicas
app.use("/auth", authRouter);

// Rotas protegidas
app.use("/occurrences", authenticateToken, occurrencesRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
