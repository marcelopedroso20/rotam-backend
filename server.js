import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";
import efetivoRoutes from "./routes/efetivo.js";
import authRoutes from "./routes/auth.js";
import occurrencesRoutes from "./routes/occurrences.js";

dotenv.config();
const app = express();

// 🧩 Middlewares globais
app.use(cors());
app.use(express.json({ limit: "10mb" })); // aumenta o limite para imagens base64

// 🧱 Verificação simples da conexão com o banco
db.connect()
  .then(() => console.log("🟢 Conectado ao banco de dados com sucesso!"))
  .catch((err) => console.error("🔴 Erro ao conectar ao banco:", err.message));

// 🔸 Rotas principais da API
app.use("/api/auth", authRoutes);
app.use("/api/occurrences", occurrencesRoutes);
app.use("/api/efetivo", efetivoRoutes); // Rota de cadastro militar

// 🔸 Rota inicial de teste (ping)
app.get("/", (req, res) => {
  res.send("🚀 API ROTAM Backend funcionando e online!");
});

// 🔸 Tratamento de rota inexistente (404)
app.use((req, res) => {
  res.status(404).json({ message: "❌ Rota não encontrada." });
});

// 🔸 Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log("🌐 Ambiente:", process.env.NODE_ENV || "desenvolvimento");
  console.log("🔗 Rotas disponíveis:");
  console.log("   → /api/efetivo");
  console.log("   → /api/auth");
  console.log("   → /api/occurrences");
  console.log("   → /");
});
