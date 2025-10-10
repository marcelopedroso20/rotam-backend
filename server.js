import express from "express";
import cors from "cors";
import db from "./db.js";
import efetivoRoutes from "./routes/efetivo.js";

const app = express();

app.use(cors());
app.use(express.json());

// ⬇️ Aqui você adiciona a linha da rota nova
app.use("/api/efetivo", efetivoRoutes);

// teste
app.get("/", (req, res) => {
  res.send("API ROTAM funcionando!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
