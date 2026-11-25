# Deploy da integracao final

Este guia descreve a publicacao da branch `integracao/final-tcc-2026-11-25` nos recursos
existentes. Nao cria infraestrutura. **Os comandos de publicacao abaixo nao foram executados;
execute-os somente depois de uma autorizacao explicita para deploy.**

## Recursos que devem permanecer

| Servico | Recurso existente |
|---|---|
| Azure Resource Group | `imperio-dog-rg` |
| Azure Container App | `imperio-dog-api` |
| Azure Database for PostgreSQL | servidor `imperio-dog-db`, banco `imperiodog` |
| Regiao Azure | `brazilsouth` |
| Docker Hub | `ryliima/imperio-dog-api` |
| Vercel team / projeto | `ryliimas-projects` / `imperio-dog` |
| Vercel Root Directory | `mobile` |
| Aplicativo oficial (nao alterar) | `https://imperio-dog-fawn.vercel.app` |
| API existente | `https://imperio-dog-api.kindwater-77f7be6b.brazilsouth.azurecontainerapps.io/api` |

Nao crie resource groups, Container Apps, bancos, projetos Vercel ou repositorios Docker novos.
Nao altere as configuracoes existentes do C6 Bank. A URL oficial e o QR Code devem permanecer iguais.

## 1. Validar o codigo e os recursos

No PowerShell, na raiz do repositorio:

```powershell
git fetch origin --prune
git switch integracao/final-tcc-2026-11-25
git pull --ff-only origin integracao/final-tcc-2026-11-25
git status --short --branch
git log -1 --oneline
.\mvnw.cmd -B verify
Push-Location .\mobile
npm.cmd ci
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
Pop-Location
```

Confirme que `git status` esta limpo e que o commit testado e o commit que sera publicado.
Defina `EXPO_PUBLIC_API_URL` no ambiente de build do Vercel para a URL da API acima, incluindo
`/api`. A origem permitida no CORS do backend deve incluir `https://imperio-dog-fawn.vercel.app`.
Nao substitua valores secretos ou outras configuracoes existentes para fazer essa verificacao.

## 2. Backup e migracoes PostgreSQL

Antes de qualquer migracao, confira a conta Azure e os nomes dos recursos. Pare se o servidor
ou o banco nao corresponderem aos nomes deste guia. O backup deve ficar fora do repositorio.
Use uma conta autorizada; nao coloque senhas em argumentos, arquivos do projeto ou Git.

```powershell
az account show --output table
az postgres flexible-server show --resource-group imperio-dog-rg --name imperio-dog-db --output table
$env:PGHOST = az postgres flexible-server show --resource-group imperio-dog-rg --name imperio-dog-db --query fullyQualifiedDomainName --output tsv
$env:PGDATABASE = "imperiodog"
$env:PGUSER = Read-Host "Usuario PostgreSQL autorizado"
$backup = Join-Path $env:USERPROFILE ("imperiodog-before-integration-{0}.dump" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
pg_dump --host $env:PGHOST --port 5432 --username $env:PGUSER --dbname $env:PGDATABASE --format custom --no-owner --file $backup
pg_restore --list $backup | Select-Object -First 20
```

`pg_dump` solicitara a senha interativamente. Confirme que o backup e legivel antes de prosseguir.
Com o backup confirmado e uma janela aprovada para migracao, aplique as migracoes aditivas nesta ordem:

```powershell
$db = "host=$env:PGHOST port=5432 dbname=$env:PGDATABASE user=$env:PGUSER sslmode=require"
psql $db -v ON_ERROR_STOP=1 -f .\docs\sql\2026-11-frontend-integration.sql
psql $db -v ON_ERROR_STOP=1 -f .\docs\sql\2026-11-financial-consistency.sql
psql $db -v ON_ERROR_STOP=1 -f .\docs\sql\2026-11-profile-photos.sql
```

As migracoes adicionam campos de pets/cobrancas e a tabela `profile_photos`; nao apagam dados.
A migracao financeira cria indices unicos e deve parar em caso de dados duplicados. Investigue
e resolva inconsistencias com aprovacao; nunca descarte registros financeiros para forcar o deploy.
O rollback da aplicacao nao remove essas tabelas ou dados.

## 3. Construir e testar a imagem localmente

Com Docker Desktop ativo, rode na raiz do repositorio. A tag e o hash do commit integrado:

```powershell
$tag = (git rev-parse --short HEAD).Trim()
docker build --pull --tag "ryliima/imperio-dog-api:$tag" .
```

Para publicar, primeiro confira que o branch, o commit e os testes sao os aprovados. O login deve
ser interativo; nao passe tokens como argumentos:

```powershell
docker login --username ryliima
docker push "ryliima/imperio-dog-api:$tag"
```

O container usa Java 21, inicia como usuario sem privilegios e escuta a porta 8080 (ou `PORT` /
`WEBSITES_PORT`). O health endpoint e `/actuator/health`. As variaveis de conexao PostgreSQL,
JWT e CORS devem ser mantidas no Container App existente; nao grave seus valores neste repositorio.

Variaveis relevantes do backend:

| Variavel | Uso |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod`; o Dockerfile ja define esse profile. |
| `DB_URL` | URL JDBC PostgreSQL com TLS, por exemplo `jdbc:postgresql://<host>:5432/imperiodog?sslmode=require`. |
| `DB_USERNAME` / `DB_PASSWORD` | Credenciais armazenadas como secrets no Container App. |
| `JWT_SECRET` | Secret de producao forte; nunca usar o fallback de desenvolvimento. |
| `CORS_ALLOWED_ORIGINS` | Deve permitir a origem oficial `https://imperio-dog-fawn.vercel.app`. |
| `DDL_AUTO` | O padrao da aplicacao e `update`; nao mudar para `validate` sem confirmar que todas as migracoes foram aplicadas. |
| `PORT` / `WEBSITES_PORT` | Porta HTTP; padrao 8080. |
| `C6_*` | Preservar os valores existentes; nao alterar nem testar operacoes bancarias no deploy desta integracao. |

## 4. Atualizar o Container App existente

Confirme a subscription e a imagem atual antes de atualizar. Guarde `$previousImage` para rollback:

```powershell
az containerapp show --resource-group imperio-dog-rg --name imperio-dog-api --query "{name:name,environment:properties.environmentId,image:properties.template.containers[0].image}" --output yaml
$previousImage = az containerapp show --resource-group imperio-dog-rg --name imperio-dog-api --query "properties.template.containers[0].image" --output tsv
az containerapp update --resource-group imperio-dog-rg --name imperio-dog-api --image "ryliima/imperio-dog-api:$tag"
az containerapp revision list --resource-group imperio-dog-rg --name imperio-dog-api --output table
Invoke-RestMethod https://imperio-dog-api.kindwater-77f7be6b.brazilsouth.azurecontainerapps.io/actuator/health
```

Valide health, login, cobranca simulada persistida para o tutor correto, isolamento entre tutores,
fotos e logs da revisao antes de considerar a API aprovada. Nao execute operacoes no C6.

Rollback da imagem, caso a revisao nova falhe:

```powershell
az containerapp update --resource-group imperio-dog-rg --name imperio-dog-api --image $previousImage
az containerapp revision list --resource-group imperio-dog-rg --name imperio-dog-api --output table
Invoke-RestMethod https://imperio-dog-api.kindwater-77f7be6b.brazilsouth.azurecontainerapps.io/actuator/health
```

Nao restaure o backup sobre o banco como rollback de rotina. Mantenha as migracoes aditivas e
reverta somente a imagem, salvo decisao operacional separada.

## 5. Publicar o frontend Vercel existente

Confirme no dashboard que o team e o projeto continuam `ryliimas-projects` / `imperio-dog`,
Root Directory `mobile`, build `npm run build`, saida `dist` e a variavel `EXPO_PUBLIC_API_URL`
com a API atual. A URL publica deve continuar `https://imperio-dog-fawn.vercel.app`.

Quando houver autorizacao explicita para publicar o frontend, use o CLI sem instalacao global e
confirme que o link local aponta para o projeto existente antes de aceitar o deploy:

```powershell
Push-Location .\mobile
npx.cmd vercel --version
npx.cmd vercel whoami
npx.cmd vercel link --project imperio-dog --scope ryliimas-projects
npx.cmd vercel --prod --scope ryliimas-projects
Pop-Location
```

Se o CLI indicar outra equipe/projeto, ou oferecer criar um novo projeto, cancele. Para rollback,
promova pelo dashboard Vercel um deployment anterior conhecido como funcional; nao mude o dominio.
