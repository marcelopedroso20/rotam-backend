# ROTAM Backend v2.2.0 — Consolidado

Node.js + Express + PostgreSQL (Render/Railway) com autenticação JWT, CRUD de **efetivo**, **viaturas**, **occurrences** e **Mapa de Força** (Leaflet).

## 🚀 Como rodar

1. Copie `.env.example` para `.env` e preencha:
   ```env
   DATABASE_URL=postgresql://rotam_user:SENHA@host:5432/rotam_database
   JWT_SECRET=sua-chave-secreta
   PORT=3000
   ALLOWED_ORIGINS=https://marcelopedroso20.github.io,http://localhost:5500,http://127.0.0.1:5500
   ```
2. Instale dependências:
   ```bash
   npm i
   ```
3. Suba o servidor:
   ```bash
   npm start
   ```
4. Crie tabelas e admin:
   - `GET /setup-db`
   - `GET /setup-admin` → cria `adm/adm`

5. Login:
   - `POST /api/auth/login` com JSON:
     ```json
     { "usuario": "adm", "senha": "adm" }
     ```
   - Use o token no header: `Authorization: Bearer <token>`

6. Mapa:
   - Abra `GET /public/maps/mapa.html` (no mesmo host do backend).

## 📚 Endpoints

- `GET /db-test` — Testa conexão e lista tabelas
- `GET /setup-db` — Cria/atualiza tabelas padronizadas
- `GET /setup-admin` — Cria admin `adm/adm`

- `POST /api/auth/login`

- `GET/POST/PUT/DELETE /api/efetivo`
- `GET/POST/PUT/DELETE /api/viaturas`
- `GET/POST/PUT/DELETE /api/occurrences`

- `GET /api/map/efetivo`
- `GET /api/map/viaturas`
- `GET /api/map/occurrences`

## ⚠️ Notas importantes
- **Não use** `routes/setup-db.js` antigos — este projeto já tem `/setup-db` padronizado no `server.js`.
- Se o frontend estiver em outro domínio, inclua a origem em `ALLOWED_ORIGINS`.
- Se existir tabela `users` do projeto antigo, remova-a (mantemos `usuarios`).

---

Feito para o Projeto ROTAM 🚓
