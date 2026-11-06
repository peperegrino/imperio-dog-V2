# Frontend e backend integrados

Fonte do frontend: `origin/frontend`, commit `3fb6eb3`. O diretorio `mobile/` foi
incorporado ao workspace local preservando as alteracoes financeiras locais.
No GitHub, o frontend permanece na branch `frontend` e a API na branch `backend`,
conforme a organizacao solicitada. As branches se integram por HTTP e nao foram
mescladas. Cada branch tem seu proprio pipeline de validacao.

## Comparacao e decisoes

| Fluxo original | Diferenca encontrada | Integracao |
|---|---|---|
| Cadastro publico | `/auth/register` inexistente e formulario sem CPF/endereco | Rota publica cria somente CLIENT; formulario coleta os dados para boleto |
| Cadastro da equipe | Nenhuma requisicao; promessa de envio de credenciais nao implementada | Cadastro real, com pet opcional salvo atomicamente em `/admin/customers/with-pet` |
| Pets | Lista vazia fixa; sexo, peso, nascimento e observacoes sem persistencia | Campos persistidos; tutor consulta/cria seus pets sem escolher outro responsavel |
| Catalogo | Precos demonstrativos e alteracoes locais | CRUD real; cada modalidade/porte e um servico com preco proprio |
| Cobranca | Cliente/pet fixos, itens sem API, multiplos servicos versus um servico no backend | Selecao real, itens e quantidades; total e calculado pelo servidor; precos e nomes sao preservados |
| Dashboard/historico | Faturas, valores, estadias e nomes ficticios | Resumos derivados da API; estadias, metas, agendas e beneficios ficticios nao sao apresentados como dados reais |
| Pagamento | Linha digitavel e valores constantes | Consulta por ID, copia da linha real e PDF autenticado; nenhum dado bancario inventado |
| Perfil | Identidade fixa e preferencias sem API | Consulta real e edicao de nome/telefone |
| Sessao | Telas protegidas ainda registradas para visitantes | Rotas condicionadas a sessao e perfil; backend continua sendo a autoridade de acesso |

As rotas de trabalho usam `mobile/src/screens/Connected/` e o layout compartilhado
`ConnectedUI`. Componentes, assets e telas originais permanecem disponiveis como
referencia visual, mas as telas demonstrativas antigas nao sao as rotas em uso.

## Executar

1. JDK 21, Node 24 e dois checkouts: um da branch `backend` para a API e outro da
   branch `frontend` para o app. No checkout frontend, execute `cd mobile` e `npm ci`.
2. Backend: preencha o `.env` da raiz com DB_URL/DB_USERNAME/DB_PASSWORD e configure
   ADMIN_EMAIL/ADMIN_PASSWORD para o primeiro administrador (senha >=12 caracteres).
3. Banco novo e vazio: aplique `docs/sql/2026-11-initial-schema.sql` em uma transacao.
   Banco existente:
   backup e aplicacao em ordem de `docs/sql/2026-11-financial-consistency.sql` e
   `docs/sql/2026-11-frontend-integration.sql`; depois valide com `DDL_AUTO=validate`.

   Em 05/11/2026, o schema public vazio do Neon configurado localmente recebeu o
   script inicial completo. Foram confirmadas seis tabelas, seis chaves estrangeiras,
   indices financeiros e compatibilidade com o Hibernate usando ddl-auto=validate.
   Nao foram inseridos usuarios nem dados de demonstracao. O .env local foi ajustado
   para DDL_AUTO=validate apos essa verificacao.
4. Na raiz do checkout backend: `mvnw.cmd spring-boot:run` (ou `mvn spring-boot:run`).
5. Copie `mobile/.env.example` para `mobile/.env.local`. Para navegador local,
   `EXPO_PUBLIC_API_URL=http://localhost:8080/api`.
6. Em `mobile/`: `npm run web`. A origem padrao Expo `http://localhost:8081` esta
   incluida no CORS. No celular, use o IP LAN do computador no lugar de localhost,
   libere a porta no firewall e reinicie o Expo apos mudar o ambiente.

Variaveis EXPO_PUBLIC sao publicas: nunca coloque credenciais Neon/C6 no frontend.
O frontend se comunica apenas com a API, nunca diretamente com o Neon.

## Validar

Backend: `mvnw.cmd verify -Ppostgres-it`.
Frontend: `npm run lint`, `npm run typecheck`, `npm run build`.
O frontend e JavaScript; o comando de tipos valida a configuracao/compilacao com
allowJs e checkJs desligado, nao representa tipagem completa dos contratos.

O teste `FrontendContractTest` cobre os contratos HTTP com login JWT real, cadastro
CLIENT, pets com dados adicionais e isolamento, restricao ADMIN, cobranca com mais
de um item e quantidade, idempotencia e preflight CORS. O C6 e simulado nos testes.

Validacao executada: 21 testes Java passaram (incluindo 6 em PostgreSQL temporario),
lint sem avisos/erros, verificacao estatica e exportacao web passaram. No Edge
headless, contra a API real com H2 isolado, passaram cadastro, login de tutor,
criacao/listagem de pet, logout, login ADMIN e criacao/listagem de servico, sem
erros JavaScript. O Neon nao foi alterado durante esses testes.

Credenciais C6 continuam necessarias para emitir/consultar boletos pelo app. Sem
elas, a falha aparece na interface, e a tentativa fica preservada para conciliacao.
Nao existe modo de pagamentos ficticios habilitado na aplicacao.

Em caso de timeout, restaure o formulario pendente; a chave de idempotencia fica
guardada por conta no armazenamento local. Nao apague os dados do app para repetir
uma emissao incerta. Consulte o historico e concilie com o banco.

O npm audit do SDK Expo 58 reporta vulnerabilidades transitivas, incluindo Zod 3
utilizado pelo CLI. A sugestao automatica inclui downgrade de SDK e nao foi aplicada;
isso precisa ser reavaliado na atualizacao do Expo. Nao houve auditoria de seguranca
completa nem validacao de binarios Android/iOS neste trabalho.
