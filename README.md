# Império Dog

Versão integrada do projeto de TCC: API Java/Spring Boot na raiz e aplicativo
Expo/React Native em `mobile/`, com suporte a navegador e dispositivos móveis.

## Estrutura e branches

- `main`: versão integrada e validada para demonstração.
- `backend`: desenvolvimento da API.
- `frontend`: desenvolvimento do aplicativo.
- `integracao/main`: integração revisável das duas partes.

A main preserva os históricos das duas branches. API e aplicativo continuam como
processos separados que se comunicam por HTTP.

## Executar localmente

Requisitos: JDK 21, Node.js 24 e acesso a PostgreSQL.

1. Copie `.env.example` para `.env` na raiz. Configure `DB_URL`, `DB_USERNAME`,
   `DB_PASSWORD` e `JWT_SECRET` (valor aleatório privado de pelo menos 32 bytes).
   No primeiro uso, configure `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mínimo 12 caracteres).
2. Para banco vazio, aplique `docs/sql/2026-11-initial-schema.sql`. Para banco
   existente, siga as migrações em `docs/FRONTEND_BACKEND_INTEGRATION.md`.
   Depois da preparação do schema, use `DDL_AUTO=validate`.
3. Inicie a API na raiz com `mvnw.cmd spring-boot:run` no Windows ou
   `bash mvnw spring-boot:run` no Linux/macOS. Porta padrão: 8080.
4. Em outro terminal, entre em `mobile/`, execute `npm ci` e copie `.env.example`
   desse diretório para `.env.local`. Configure
   `EXPO_PUBLIC_API_URL=http://localhost:8080/api`.
5. Execute `npm run web` em `mobile/`. A origem padrão `http://localhost:8081`
   está permitida pelo CORS da API.

No celular, use o IP LAN do computador no lugar de localhost e reinicie o Expo
após mudar a configuração. Credenciais do banco/C6 pertencem somente ao backend;
variáveis EXPO_PUBLIC são públicas.

## Funcionalidades conectadas

Cadastro e login de tutores; gestão administrativa de clientes, pets e serviços;
perfil autenticado; painel financeiro; cobranças com itens e quantidades;
histórico filtrado; linha digitável e download autenticado de boleto.

A emissão real exige credenciais e certificado do C6 no backend. A integração
bancária foi testada com respostas simuladas; a homologação real permanece pendente.
Sem credenciais, o aplicativo apresenta a falha e preserva a tentativa para conciliação.

## Verificações

Na raiz: `mvnw.cmd verify -Ppostgres-it` (Windows) ou
`bash mvnw verify -Ppostgres-it` (Linux/macOS).

Em `mobile/`: `npm run lint`, `npm run typecheck` e `npm run build`.
O código do app é JavaScript; a verificação estática não representa tipagem completa.
O CI executa as verificações do backend e frontend em jobs separados.

## Documentação

- [Contratos e integração](docs/FRONTEND_BACKEND_INTEGRATION.md)
- [Execução do aplicativo](docs/INTEGRATION.md)
- [Rotas e testes da API](docs/API_TESTING_FRONTEND.md)
- [Conciliação e homologação C6](docs/PRODUCTION_VALIDATION.md)
- [Implantação](docs/DEPLOY.md)

Nunca versione `.env`, senhas, tokens, certificados ou chaves privadas.
