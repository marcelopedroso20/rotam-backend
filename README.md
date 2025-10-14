# ROTAM Backend v2 — Ocorrências + Mapa de Força

API em Node.js/Express + PostgreSQL (Railway) com autenticação JWT, CRUD de **efetivo**, **viaturas**, **ocorrências**, e **Mapa de Força** com Leaflet (HTML pronto).

## 🚀 Rotas de Setup
- `GET /setup-admin` → cria tabela `usuarios` e o usuário padrão `adm/adm` (com hash).
- `GET /setup-db` → cria/atualiza as tabelas `efetivo`, `viaturas`, `occurrences`.

## 🔐 Autenticação
- `POST /api/auth/login` `{ "usuario":"adm", "senha":"adm" }`
- Use o token JWT no header: `Authorization: Bearer <token>`

## 📦 Tabelas

### usuarios
- `id`, `usuario` (unique), `senha_hash`, `role`, `created_at`

### efetivo
- `id`, `nome`, `patente`, `funcao`, `setor`, `turno`, `viatura`, `placa`, `status` (default: Disponível), `latitude`, `longitude`, `foto`, `atualizado_em`

### viaturas
- `id`, `prefixo` (unique), `placa`, `modelo`, `status` (default: Disponível), `localizacao`, `latitude`, `longitude`, `atualizado_em`

### occurrences
- `id`, `titulo`, `descricao`, `data`, `local`, `latitude`, `longitude`, `equipe_id`, `equipe_nome`, `status` (default: Concluída), `observacoes`, `registrado_por`

## 🗺️ Mapa de Força (Leaflet)
- Abra `GET /public/maps/mapa.html`
- Consome estes endpoints:
  - `GET /api/map/efetivo`
  - `GET /api/map/viaturas`
  - `GET /api/map/occurrences`

## 📚 CRUDs
- `GET/POST/PUT/DELETE /api/efetivo`
- `GET/POST/PUT/DELETE /api/viaturas`
- `GET/POST/PUT/DELETE /api/occurrences`

## ▶️ Como rodar
1. Copie `.env.example` para `.env` e preencha `DATABASE_URL` e `JWT_SECRET`.
2. `npm i`
3. `npm run dev` (ou `npm start`)
4. Acesse `GET /setup-admin`
5. Acesse `GET /setup-db`
6. Faça login: `POST /api/auth/login`
7. Abra o mapa: `GET /public/maps/mapa.html`

## 🔒 Observações
- Restrinja `cors.origin` para seu domínio de frontend em produção.
- Não exponha dados sensíveis (nomes/coords reais) sem autorização.
