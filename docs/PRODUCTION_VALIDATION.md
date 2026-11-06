# Validacao financeira e homologacao

## Verificacao automatica

Com JDK 21 e Maven, execute `./mvnw verify -Ppostgres-it` (Windows: `mvnw.cmd`).
O profile inicia um PostgreSQL 16.13 temporario em porta aleatoria, executa os
cenarios financeiros e encerra o servidor. Nao usa um banco existente e nao depende
de Docker. Os testes comuns usam H2; os testes `FinancialPostgresIT` usam PostgreSQL.
Os testes `C6BankContractTest` simulam HTTP. Eles verificam o contrato implementado,
mas NAO comprovam a homologacao, OAuth/mTLS ou os formatos reais da conta C6.

## Mudanca obrigatoria no frontend

`POST /api/admin/charges` exige `Idempotency-Key`, com 16 a 128 caracteres
alfanumericos, `_` ou `-` (por exemplo um UUID). Gere uma chave por operacao e
guarde-a antes de enviar. Em timeout, erro 502 ou repeticao do clique, reutilize a
mesma chave e o mesmo corpo. Nunca gere outra chave para tentar recuperar a mesma
cobranca. A mesma chave com outro corpo retorna 409.

A resposta de cobranca inclui `issuanceState` e `externalReferenceId`.
`ISSUING` significa tentativa persistida/em andamento; `UNKNOWN` significa resultado
incerto e exige conciliacao; `ISSUED` significa boleto vinculado. O status financeiro
`PENDING` sozinho nao comprova que houve emissao. Nao apresentar uma tentativa sem
boleto como boleto disponivel. Dados legados podem ter `issuanceState` nulo.

## Recuperacao apos falha ou reinicio

Nao ha reenvio automatico de POST ao C6, porque nao foi comprovada a garantia de
idempotencia do provedor. A tentativa e sua referencia sao gravadas ANTES da chamada
externa; um crash pode deixar `ISSUING` mesmo que o banco tenha aceitado o boleto.
O administrador identifica a tentativa em `GET /api/admin/charges`.

1. Consulte no C6 a referencia `externalReferenceId` e obtenha o id do boleto.
2. Chame `POST /api/admin/charges/{id}/reconcile?bankSlipId={idNoC6}` com JWT ADMIN.
3. O backend consulta o C6 e exige coincidencia de referencia, valor, vencimento e
   CPF antes de vincular. Dados ausentes ou diferentes bloqueiam a conciliacao.
4. A sincronizacao agendada acompanha o boleto vinculado. Notificacoes repetidas
   nao desfazem pagamento nem alteram sua data.

Se o banco confirmar que nao houve emissao, investigue e documente o incidente antes
de criar uma nova operacao com outra chave. Esta versao nao libera automaticamente
tentativas incertas para reemissao. Reconciliar nao envia um novo boleto ao banco.

## Atualizacao de banco existente

Com backup e escrita suspensa, aplique `docs/sql/2026-11-financial-consistency.sql`
antes de iniciar a nova versao. O script preserva registros e captura os nomes atuais
das cobrancas legadas; nomes historicos anteriores nao podem ser recuperados.
Ele aborta se houver ids C6 duplicados. Resolva a origem dos duplicados antes de
prosseguir. Configure `DDL_AUTO=validate` apos validar o schema. Este script e um
upgrade incremental do schema existente, nao um baseline completo de migracoes.

## Roteiro de homologacao C6 (pendente de credenciais reais)

Use exclusivamente uma conta sandbox e dados de teste autorizados. Configure
`C6_API_BASE_URL`, `C6_CLIENT_ID`, `C6_CLIENT_SECRET`, `C6_CERTIFICATE_PATH`,
`C6_CERTIFICATE_PASSWORD`, `C6_BILLING_SCHEME`, `C6_WEBHOOK_URL` HTTPS e
`C6_WEBHOOK_TOKEN` no ambiente local protegido. Nao envie segredos em mensagens.
Consulte o contrato habilitado para a conta em https://developers.c6bank.com.br/.

Registre data, ambiente, referencia externa, id do boleto e resultado de cada caso
sem registrar tokens, certificados ou dados pessoais completos:

- Autenticacao OAuth com mTLS e renovacao apos expiracao.
- Emissao com pagador de teste e referencia persistida; consultar id, valor,
  vencimento, referencia e CPF na resposta real de GET.
- Download do PDF e conferencia do valor e vencimento.
- Repetir o POST da API local com a mesma chave; conferir apenas um boleto no C6.
- Interromper a resposta apos a emissao e reiniciar o backend; conciliar a tentativa
  existente sem reemitir. Conferir se o GET real fornece os campos exigidos.
- Simular pagamento pelo mecanismo de sandbox do banco; validar webhook autenticado,
  sincronizacao agendada, status e data de pagamento.
- Reenviar notificacao e receber notificacao antiga; pagamento deve permanecer.
- Cancelar um boleto no sandbox; confirmar sincronizacao para CANCELED.
- Rejeitar webhook com token incorreto e acesso de outro cliente ao boleto/PDF.

Sem esses resultados no sandbox, a integracao permanece NAO HOMOLOGADA.
O teste de PostgreSQL local valida o comportamento da aplicacao; a infraestrutura
de destino ainda exige teste de conexao TLS, permissoes, backup/restauracao e deploy.
