# Infra: Postgres local com Docker Compose

# Infra: Postgres local com Docker Compose

Arquivos criados:

- `docker-compose.yml` - serviços `db` (Postgres), `pgadmin` e `api` (servidor Node) para desenvolvimento.
- `.env.example` - exemplo de variáveis de ambiente (não comitar credenciais reais).
- `server/` - servidor Node/Express mínimo que usa `pg` para conectar ao Postgres.

Instruções rápidas (zsh):

```bash
# copiar .env.example para .env e editar credenciais
cp .env.example .env
# subir containers (constrói o api automaticamente)
docker compose up -d --build
# ver logs do banco
docker compose logs -f db
# entrar no psql do container (usa as variáveis do .env)
docker compose exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

Rodando o servidor Node localmente (na sua máquina):

1. Entre em `server/` e instale dependências:

```bash
cd server
npm install
```

2. Defina `DATABASE_URL` no `.env` (veja `.env.example`). Se estiver rodando o Postgres via docker compose na mesma máquina, use `localhost` no `DATABASE_URL` quando rodando o server localmente. Quando o `api` roda em container, ele usa `db` como hostname (a `DATABASE_URL` do `api` é configurada no `docker-compose.yml`).

3. Inicie o servidor localmente (opcional):

```bash
npm start
```

Rodando tudo em containers (db + pgadmin + api)

```bash
# certifique-se de ter criado `.env` a partir de `.env.example`
cp .env.example .env
# subir e construir o api automaticamente
docker compose up -d --build
# ver status
docker compose ps
# logs do api
docker compose logs -f api
```

A API ficará disponível em: http://localhost:3000

Observações:
 - Crie a tabela `users` manualmente ou utilize `infra/seed_users.sql` (ex.: via `docker compose exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/seed_users.sql`).
 - O valor recomendado para `POSTGRES_DB` no `.env` é `postgres` (o nome do banco criado pelo container). Se o seu `.env` apontar para outro nome, atualize ou rode o seed no banco correto.
 - Use os scripts npm de conveniência:
	 - `npm run infra:up` — sobe o infra (equivalente a `docker compose up -d --build`).
	 - `npm run infra:seed` — executa o seed dentro do container.
	 - `npm run infra:bootstrap` — (mais robusto) cria role se necessário e executa o seed.
 - Não comite o arquivo `.env` com credenciais reais.
