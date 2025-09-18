import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("API ROTAM Backend funcionando 🚔");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
