# Imperio Dog API

API REST para cadastro administrativo de clientes, pets e serviços, autenticação JWT e cobrança por boleto bancário do C6 Bank. O projeto usa Java 21, Spring Boot, Spring Security, Spring Data JPA e MySQL.

## Configuração

O C6 Bank exige credenciais OAuth2 e certificado de cliente mTLS para suas APIs. Solicite acesso e credenciais no [portal oficial C6 Bank Developers](https://developers.c6bank.com.br/). A disponibilidade de produção e eventuais tarifas dependem da conta e da habilitação do produto no C6.

Copie `.env.example` para `.env` e preencha os segredos localmente. `.env` está ignorado pelo Git e excluído do contexto de build do Docker; não o adicione à força. Nunca versione certificados, chaves, exportações de banco de dados ou credenciais.

O C6 fornece certificado e chave privada. Converta-os para PKCS#12 em `secrets/`, mantendo o arquivo e a senha fora do repositório:

```powershell
openssl pkcs12 -export -in certificado.crt -inkey certificado.key `
  -out secrets/c6-client.p12 -name c6-bank-client
```

Defina as variáveis de ambiente antes de iniciar:

| Variável | Uso |
| --- | --- |
| `DB_NAME`, `DB_URL` | Nome do banco e JDBC MySQL |
| `DB_USERNAME`, `DB_PASSWORD` | Credenciais MySQL |
| `JWT_SECRET` | Segredo HMAC JWT com ao menos 32 bytes |
| `JWT_EXPIRATION_MS` | Validade do JWT em ms; padrão: 24 horas |
| `C6_API_BASE_URL` | Sandbox por padrão: `https://baas-api-sandbox.c6bank.info`; produção: `https://baas-api.c6bank.info` |
| `C6_CLIENT_ID`, `C6_CLIENT_SECRET` | Credenciais OAuth2 C6 |
| `C6_CERTIFICATE_PATH`, `C6_CERTIFICATE_PASSWORD` | Caminho e senha do certificado PKCS#12 mTLS |
| `C6_BILLING_SCHEME` | `21` para sandbox; `15` para produção |
| `C6_WEBHOOK_URL` | URL pública HTTPS da rota `/api/webhooks/c6` (sem token) |
| `C6_WEBHOOK_TOKEN` | Segredo aleatório anexado à URL do webhook para validar notificações |
| `C6_STATUS_SYNC_INTERVAL_MS` | Intervalo de reconciliação de status, em ms; padrão: 5 minutos |

Use as credenciais, carteira e endereço base do mesmo ambiente. Para produção, configure simultaneamente a URL de produção e carteira `15`. Nunca versione segredos ou certificados.

Copie `.env.example` para `.env` antes da primeira execução. O `.env` local já contém segredos aleatórios para o banco de desenvolvimento, JWT e webhook; substitua-os se necessário e preencha os valores C6 quando receber as credenciais. Os segredos e parâmetros são lidos de `.env` durante a inicialização local. Não cole segredos no terminal, README, Compose ou arquivos Java.

O arquivo `.env` local não contém credenciais C6 reais. Antes de criar boletos, preencha client ID/secret, senha do certificado e token do webhook fornecidos/gerados fora do repositório. O webhook e os boletos C6 só funcionarão após essa configuração.

Sem as credenciais C6, o restante da aplicação pode iniciar, mas a emissão e o download de boletos retornarão erro de configuração. Se o webhook não estiver configurado, a aplicação continuará consultando os boletos em aberto periodicamente. Com uma URL pública e token configurados, ela registra automaticamente no C6 o webhook `BANK_SLIP`; cada notificação é validada consultando o estado atual do boleto na API do banco.

## Iniciar e testar

```powershell
.\mvnw.cmd -DskipTests compile
.\mvnw.cmd spring-boot:run
```

Os testes de serviço não precisam do banco. O teste de contexto completo precisa de MySQL e `JWT_SECRET`:

```powershell
.\mvnw.cmd -Dtest=ServiceLayerTests test
.\mvnw.cmd test
```

## Primeiro administrador

Não há cadastro público de administradores. Após o Hibernate criar as tabelas, gere um hash BCrypt e insira o primeiro administrador diretamente no banco:

```sql
INSERT INTO users (name, email, password, phone, cpf, role)
VALUES ('Administrador', 'admin@imperio-dog.local', '$2a$12$HASH_BCRYPT', NULL, '52998224725', 'ADMIN');
```

O CPF deve ser único. Insira somente o hash da senha, nunca a senha em texto puro.

## Fluxo de cobrança

O administrador cadastra clientes em `POST /admin/customers`, serviços em `POST /admin/services` e pets em `POST /admin/pets`. Em seguida cria a cobrança e o boleto C6:

```json
{
  "customerId": 1,
  "petId": 1,
  "serviceId": 1,
  "serviceDate": "2026-10-14",
  "dueDate": "2026-10-20"
}
```

Envie o JSON para `POST /api/admin/charges` com o JWT de administrador. A resposta inclui o status, o cliente, a linha digitável, o código de barras e `ticketUrl`. O cliente autenticado baixa o PDF pelo link; a autorização verifica que a cobrança pertence a ele. O CPF, CEP e endereço usados no boleto vêm dos dados do cliente.

Clientes consultam seu perfil em `GET /api/customers/me` e suas cobranças em `GET /api/charges/my-charges`. A API marca cobranças não pagas vencidas como `OVERDUE`. O administrador consulta todas as cobranças em `GET /api/admin/charges` e pode filtrar por `status`, por exemplo `PENDING`, `OVERDUE` ou `PAID`, para acompanhar pendências e histórico.

O status é atualizado por notificações C6 e por reconciliação periódica dos boletos abertos. Estados reconhecidos: `CREATED` (pendente ou vencido), `PAID` e `CANCELLED`. Cobranças existentes do Mercado Pago mantêm seus identificadores e links históricos no banco, mas não são migradas nem sincronizadas com o C6; cobranças novas usam exclusivamente o C6.

## Rotas

| Método e rota | Acesso | Ação |
| --- | --- | --- |
| `POST /api/auth/login` | Público | Autentica e retorna JWT |
| `POST /api/webhooks/c6?token=...` | Público, token obrigatório | Recebe notificações C6 de boletos |
| `POST /api/admin/customers`, `GET /api/admin/customers` | Administrador | Cria e lista clientes |
| `/api/admin/services/**`, `/api/admin/pets/**` | Administrador | Gerencia serviços e pets |
| `POST /api/admin/charges` | Administrador | Cria cobrança e boleto C6 |
| `GET /api/admin/charges?status=...` | Administrador | Lista cobranças e histórico |
| `GET /api/customers/me` | Cliente | Consulta o próprio perfil |
| `GET /api/charges/my-charges` | Cliente | Lista as próprias cobranças |
| `GET /api/charges/{id}` | Dono da cobrança ou administrador | Consulta cobrança |
| `GET /api/charges/{id}/boleto` | Dono da cobrança ou administrador | Baixa boleto PDF do C6 |

As rotas antigas sem prefixo `/api` continuam disponíveis para compatibilidade. Veja `docs/API_TESTING_FRONTEND.md` para exemplos de integração frontend.

## Operação

O Hibernate usa `ddl-auto=update` para o estágio atual do projeto; use migrações versionadas antes de produção. O C6 requer certificado mTLS, conectividade com o ambiente escolhido e acesso habilitado para emissão de boletos. Para receber webhooks, exponha a rota HTTPS publicamente e mantenha `C6_WEBHOOK_TOKEN` em segredo.

## Publicação segura em um novo repositório

Se qualquer senha, token, chave ou certificado já foi enviado a um repositório remoto, considere-o comprometido: revogue/rotacione as credenciais no provedor antes de reutilizar a integração. Apagar o valor dos arquivos ou adicioná-lo ao `.gitignore` não remove versões anteriores do histórico Git. Para publicar em um repositório novo, crie um repositório vazio e envie somente uma cópia limpa dos arquivos versionáveis, sem a pasta `.git`, `.env`, `secrets/`, certificados ou dumps. Não publique o histórico antigo; configure então um remote novo. Verifique o conteúdo do commit inicial antes do push.
