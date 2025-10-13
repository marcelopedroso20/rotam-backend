// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";
import efetivoRoutes from "./routes/efetivo.js";
import authRoutes from "./routes/auth.js";
import occurrencesRoutes from "./routes/occurrences.js";

dotenv.config();
const app = express();

// 🌍 Middlewares globais
app.use(cors({
  origin: "*", // ou defina ["https://marcelopedroso20.github.io"] para segurança
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" })); // permite imagens base64 ou payloads grandes

// 🧱 Teste da conexão com o banco PostgreSQL
db.connect()
  .then(() => console.log("🟢 Conectado ao banco de dados PostgreSQL com sucesso!"))
  .catch((err) => console.error("🔴 Erro ao conectar ao banco:", err.message));

// 🚦 Rotas principais
app.use("/api/auth", authRoutes);         // Login / autenticação
app.use("/api/efetivo", efetivoRoutes);   // Cadastro militar
app.use("/api/occurrences", occurrencesRoutes); // Ocorrências / relatórios

// 🔍 Rota inicial de teste (status da API)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "🚀 API ROTAM Backend funcionando e online!",
    versao: "1.0.0",
  });
});

// ⚠️ Tratamento para rotas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "❌ Rota não encontrada.",
    rota: req.originalUrl,
  });
});

// ⚙️ Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log("🌐 Ambiente:", process.env.NODE_ENV || "desenvolvimento");
  console.log("🔗 Rotas disponíveis:");
  console.log("   → /api/auth/login");
  console.log("   → /api/efetivo");
  console.log("   → /api/occurrences");
  console.log("   → /");
});
