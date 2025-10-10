import express from "express";
import cors from "cors";
import db from "./db.js";
import dotenv from "dotenv";
import efetivoRoutes from "./routes/efetivo.js";
import authRoutes from "./routes/auth.js";
import occurrencesRoutes from "./routes/occurrences.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 🔸 Rotas principais
app.use("/api/auth", authRoutes);
app.use("/api/occurrences", occurrencesRoutes);
app.use("/api/efetivo", efetivoRoutes);  // ← esta é a que precisamos garantir!

// 🔸 Rota inicial de teste
app.get("/", (req, res) => {
  res.send("🚀 API ROTAM backend funcionando!");
});

// 🔸 Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
