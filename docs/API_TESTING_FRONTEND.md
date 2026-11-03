# API e integração com frontend

Base local: `http://localhost:8080/api`. Em produção use a URL pública do backend (por exemplo `https://imperio-dog-api.onrender.com/api`) e guarde-a em uma variável do frontend (`VITE_API_URL`/`NEXT_PUBLIC_API_URL`). O domínio do frontend precisa estar em `CORS_ALLOWED_ORIGINS`. Todas as rotas administrativas precisam de JWT `ROLE_ADMIN`; os dados de cobrança do cliente autenticado são limitados às próprias cobranças.

## Login

```http
POST /auth/login
Content-Type: application/json

{"email":"admin@imperio-dog.local","password":"senha"}
```

Use `token` retornado no header `Authorization: Bearer <token>`. Não existe cadastro público: clientes são criados apenas por administradores (`POST /admin/customers`). O primeiro administrador é criado no boot a partir de `ADMIN_EMAIL`/`ADMIN_PASSWORD` (veja `docs/DEPLOY.md`).

Respostas `401` indicam token ausente/expirado (faça login de novo); `403` indica perfil sem permissão.

## Criar boleto

Cadastre primeiro cliente, serviço e pet usando `/admin/customers`, `/admin/services` e `/admin/pets`. O cadastro de cliente precisa de CPF, CEP, rua, número numérico, bairro, cidade e UF, necessários ao C6. A criação da cobrança usa os IDs:

```http
POST /admin/charges
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": 1,
  "petId": 1,
  "serviceId": 1,
  "serviceDate": "2026-10-14",
  "dueDate": "2026-10-20"
}
```

A resposta contém `id`, `customerId`, `customerName`, `customerEmail`, `amount`, `dueDate`, `status`, `barcode`, `digitableLine` e `ticketUrl`. A URL do boleto é um endpoint autenticado da aplicação, não um link externo exposto pelo banco.

## Cobranças do cliente e administração

```http
GET /charges/my-charges
Authorization: Bearer <token-do-cliente>

GET /admin/charges?status=OVERDUE
Authorization: Bearer <token-do-admin>

GET /admin/charges?status=PAID
Authorization: Bearer <token-do-admin>
```

O cliente pode baixar o PDF de sua cobrança usando `GET <ticketUrl>` com o mesmo JWT. Como o endpoint exige o header `Authorization`, o frontend deve usar `fetch` com o token e abrir o resultado como blob (um `<a href>` simples não envia o token); o header `Content-Disposition` está exposto ao navegador via CORS. `GET /charges/{id}` e `GET /charges/{id}/boleto` recusam clientes que não sejam donos daquela cobrança.

Os status de cobrança são `PENDING`, `PAYMENT_IN_PROCESS`, `PAID`, `OVERDUE` e `CANCELED`. Cobranças vencidas são atualizadas ao consultar listas e na reconciliação periódica. Webhooks C6 usam `POST /webhooks/c6?token=<C6_WEBHOOK_TOKEN>`; não chame essa rota diretamente do frontend.

Cobranças criadas antes da troca de provedor preservam os dados e links históricos; elas não são consultadas nem sincronizadas pelo C6.

## Erros

Erros são retornados como JSON com `status` e `error`; falhas de validação também incluem `fields`. Se as credenciais mTLS/OAuth do C6 estiverem ausentes ou inválidas, a emissão e o download do boleto falham explicitamente (503 ou 502).

## Testes

```powershell
.\mvnw.cmd -Dtest=ServiceLayerTests test
```

O teste de contexto completo `.\mvnw.cmd test` requer MySQL e uma variável `JWT_SECRET` com pelo menos 32 bytes.
