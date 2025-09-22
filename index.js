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
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Usuário e senha fixos (admin)
const ADMIN_USER = "adm";
const ADMIN_PASS = "adm";
const TOKEN = "meu-token-secreto";

// 🔑 Rota de login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true, token: TOKEN });
  }
  res.status(401).json({ success: false, message: "Usuário ou senha inválidos" });
});

// 🔒 Middleware para verificar token
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader === `Bearer ${TOKEN}`) {
    return next();
  }
  res.status(403).json({ error: "Não autorizado" });
}

// Rota principal
app.get("/", (req, res) => {
  res.send("🚔 API ROTAM Backend funcionando!");
});

// Rotas de ocorrências (protegidas por login)
app.use("/occurrences", authMiddleware, occurrencesRouter);

// Start
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
