import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// ⬇️ Aqui você adiciona a linha da rota nova
import efetivoRoutes from "./routes/efetivo.js";
app.use("/api/efetivo", efetivoRoutes);

// teste
app.get("/", (req, res) => {
  res.send("API ROTAM ativa!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
