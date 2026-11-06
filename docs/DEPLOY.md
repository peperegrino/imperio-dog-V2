# Deploy em nuvem

Arquitetura: **frontend** (Vercel) → **backend Spring Boot** (container Docker) → **PostgreSQL gerenciado**.
A Vercel não executa containers Docker nem processos Java de longa duração; hospede o backend em
Render, Railway, Fly.io ou Azure usando o `Dockerfile` deste repositório.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | sim (prod) | `prod` (o `Dockerfile` já define). Bloqueia o secret JWT de desenvolvimento. |
| `DB_URL` | sim | `jdbc:postgresql://<host>/<db>?sslmode=require` |
| `DB_USERNAME` / `DB_PASSWORD` | sim | Credenciais do banco |
| `JWT_SECRET` | sim (prod) | `openssl rand -base64 48` (mínimo 32 bytes) |
| `JWT_EXPIRATION_MS` | não | Padrão 86400000 (24 h) |
| `CORS_ALLOWED_ORIGINS` | sim | Ex.: `https://seu-app.vercel.app` (vírgula para vários) |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | não | Ex.: `https://seu-projeto-*.vercel.app` (previews) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | 1º deploy | Cria o primeiro admin se não existir nenhum. Senha ≥ 12 caracteres. Remova depois do primeiro boot. |
| `DDL_AUTO` | não | `update` (padrão) cria as tabelas; use `validate` quando adotar migrations |
| `DB_POOL_SIZE` | não | Padrão 5 (planos gratuitos têm poucas conexões) |
| `C6_*` | conforme uso | Credenciais e certificado do C6 Bank |

A porta é lida de `PORT` ou `WEBSITES_PORT` (padrão 8080). Health check: `GET /actuator/health`.

## Banco de dados

- **Neon**: `jdbc:postgresql://<host>.neon.tech/<db>?sslmode=require`.
- **Supabase**: use o *Session pooler* (a conexão direta é apenas IPv6).
- **Azure Database for PostgreSQL (Flexible Server)**:
  `jdbc:postgresql://<servidor>.postgres.database.azure.com:5432/<db>?sslmode=require`;
  libere o IP de saída do App Service/Container Apps no firewall do servidor.

## Render / Railway

1. Crie um *Web Service* a partir do repositório (branch do backend) usando o `Dockerfile`.
2. Configure as variáveis acima e o health check em `/actuator/health`.
3. Certificado `.p12` do C6: use *Secret Files* (Render) ou volume (Railway) e aponte `C6_CERTIFICATE_PATH`.

## Azure

Opção simples: **Azure App Service (Web App for Containers)** ou **Azure Container Apps**.

```bash
az group create -n imperio-dog-rg -l brazilsouth
az acr create -g imperio-dog-rg -n <acrNome> --sku Basic
az acr build -r <acrNome> -t imperio-dog-api:latest .

az appservice plan create -g imperio-dog-rg -n imperio-dog-plan --is-linux --sku B1
az webapp create -g imperio-dog-rg -p imperio-dog-plan -n <appNome> \
  --deployment-container-image-name <acrNome>.azurecr.io/imperio-dog-api:latest
az webapp config appsettings set -g imperio-dog-rg -n <appNome> --settings \
  WEBSITES_PORT=8080 SPRING_PROFILES_ACTIVE=prod \
  DB_URL=... DB_USERNAME=... DB_PASSWORD=... JWT_SECRET=... \
  CORS_ALLOWED_ORIGINS=https://seu-app.vercel.app \
  ADMIN_EMAIL=... ADMIN_PASSWORD=...
az webapp config set -g imperio-dog-rg -n <appNome> --generic-configurations '{"healthCheckPath":"/actuator/health"}'
```

Guarde segredos no **Azure Key Vault** (referências em App Settings) em vez de texto puro. Planos pagos
(B1 ou superior) não "dormem" por inatividade, o que mantém a sincronização agendada com o C6 e os webhooks estáveis.
O frontend pode continuar na Vercel ou ir para **Azure Static Web Apps**.

## Primeiro administrador

No primeiro boot com `ADMIN_EMAIL` e `ADMIN_PASSWORD` definidos e nenhum usuário `ADMIN` no banco, o admin é criado.
Se já existir um admin, nada é alterado (reiniciar não redefine senha). Faça login em `POST /auth/login`
e crie clientes com `POST /admin/customers`.
