const express = require("express");
const app = express();

app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("API do Rotam Backend funcionando 🚀");
});

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
