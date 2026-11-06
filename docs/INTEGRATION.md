# Frontend conectado a API

Na main integrada, o aplicativo Expo esta em `mobile/` e a API Java/Spring Boot na
raiz do mesmo checkout. As branches `frontend` e `backend` continuam disponiveis
para desenvolvimento separado.

## Executar

1. Instale Node 24 e execute `npm ci` dentro de `mobile/`.
2. Copie `mobile/.env.example` para `mobile/.env.local`.
3. Configure `EXPO_PUBLIC_API_URL=http://localhost:8080/api` para navegador local.
4. Inicie a API na raiz conforme o README do projeto.
5. Execute `npm run web` em `mobile/` e abra a URL indicada pelo Expo.

No celular, substitua localhost pelo IP LAN do computador que executa a API,
libere a porta no firewall e reinicie o Expo. A API permite por padrao a origem
web http://localhost:8081; configure CORS_ALLOWED_ORIGINS para outras origens.

Variaveis EXPO_PUBLIC ficam expostas no aplicativo. Credenciais Neon/C6 e segredos
JWT pertencem exclusivamente ao backend e nunca devem ser colocados nesta branch.

## Fluxos conectados

- Cadastro publico de tutor com CPF e endereco, login JWT e encerramento de sessao.
- Cadastro administrativo de cliente, com pet opcional salvo na mesma transacao.
- Consulta e cadastro de pets com especie, raca, sexo, nascimento, peso e observacoes.
- CRUD administrativo de servicos; cada modalidade/porte tem um preco proprio.
- Cobrancas com itens e quantidades; o servidor calcula o valor e preserva o historico.
- Painel com valores reais, historico filtrado e detalhes de cobranca.
- Copia da linha digitavel e download autenticado do PDF no navegador/dispositivo.
- Consulta e edicao de nome e telefone do perfil autenticado.

As rotas usam `mobile/src/screens/Connected` e `ConnectedUI`. Os componentes,
assets e telas demonstrativas anteriores foram preservados como referencia visual.
Dados ficticios de estadias, metas e pagamentos nao sao apresentados como dados reais.

## Emissao e conciliacao

A mesma operacao reutiliza a Idempotency-Key salva por conta no armazenamento local.
Em falha ou timeout, restaure o formulario pendente e confira o historico antes de
criar outra emissao. A conciliacao administrativa consulta o boleto existente no C6;
nao emite outro. Nao apague os dados locais para repetir uma tentativa incerta.

A emissao real exige credenciais e certificado C6 no backend. Os testes do contrato
bancario usam simulacao; a homologacao do banco continua pendente.

## Verificacoes

Execute `npm run lint`, `npm run typecheck` e `npm run build` em `mobile/`.
O aplicativo e JavaScript: a verificacao estatica usa allowJs com checkJs desligado,
e nao equivale a tipagem completa dos contratos. O CI executa esses tres comandos.

O teste no Edge headless, contra uma API real com H2 isolado, validou cadastro,
login de tutor, criacao/listagem de pet, logout, login ADMIN e criacao/listagem de
servicos, sem erros JavaScript. Nao foram validados binarios Android/iOS.

O npm audit do SDK Expo 58 reporta vulnerabilidades transitivas, incluindo Zod 3
no CLI. A sugestao automatica inclui downgrade de SDK e nao foi aplicada; reavalie
as dependencias durante a atualizacao do Expo.

Documentacao completa da API e scripts do banco:
[contratos e preparacao do banco](FRONTEND_BACKEND_INTEGRATION.md).
