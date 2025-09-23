// index.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import occurrencesRoutes from "./routes/occurrences.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/occurrences", occurrencesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
