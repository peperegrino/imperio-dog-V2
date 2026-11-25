# Publicação de fotos de perfil e edição de pets

Este procedimento publica a branch `feature/profile-pets-integration` no backend Azure Container Apps e no frontend Vercel existentes. Execute-o em uma estação de trabalho autorizada, depois de revisão e aprovação. **Não faça merge direto na branch de produção e não execute os passos de publicação sem autorização.**

## 1. Recuperar e validar a branch

No PowerShell:

```powershell
git clone https://github.com/peperegrino/imperio-dog-V2.git
Set-Location .\imperio-dog-V2
git fetch origin --prune
git switch --track origin/feature/profile-pets-integration
git pull --ff-only
git status
git log -5 --oneline --decorate
```

Confirme que `git status` não mostra alterações locais inesperadas. Faça a revisão e os testes antes de publicar:

```powershell
$env:JAVA_HOME = (Get-ChildItem 'C:\Program Files\Eclipse Adoptium' -Directory |
  Where-Object Name -Like 'jdk-21*' | Select-Object -First 1).FullName
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
mvn test
Push-Location .\mobile
npm ci
npm run lint
npm run typecheck
npm run build
Pop-Location
```

## 2. Preparar e verificar backup do banco

Antes de qualquer alteração, confirme a assinatura/subscription e o recurso corretos. O backup deve ser armazenado fora do repositório, com acesso restrito, e sua restauração deve ser testada conforme a política operacional.

```powershell
az login
az account show --output table
az postgres flexible-server show --resource-group imperio-dog-rg --name imperio-dog-db --output table
$backup = Join-Path $env:USERPROFILE ("imperiodog-before-profile-photos-{0}.dump" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
pg_dump "host=$env:PGHOST port=5432 dbname=imperiodog user=$env:PGUSER sslmode=require" --format=custom --no-owner --file $backup
pg_restore --list $backup | Select-Object -First 20
```

Defina `PGHOST` para o hostname confirmado do servidor PostgreSQL e `PGUSER` para o usuário autorizado. `pg_dump` solicitará a senha interativamente; não a coloque no comando, histórico do terminal, arquivo do projeto ou Git. Pare se não for possível verificar o recurso/backup.

## 3. Aplicar a migração aditiva do banco

O armazenamento é PostgreSQL `bytea`, persistente e sem serviço adicional. A tabela `profile_photos` referencia `users` e `pets` com exclusão em cascata e uma restrição para vincular cada foto a exatamente um proprietário. O script é idempotente. Hibernate pode criar a tabela por `DDL_AUTO=update`; aplicar o script explicitamente antes do deploy é uma etapa verificável. Não remova nem altere dados existentes.

```powershell
psql "host=$env:PGHOST port=5432 dbname=imperiodog user=$env:PGUSER sslmode=require" -v ON_ERROR_STOP=1 -f .\docs\sql\2026-11-profile-photos.sql
psql "host=$env:PGHOST port=5432 dbname=imperiodog user=$env:PGUSER sslmode=require" -v ON_ERROR_STOP=1 -c "SELECT to_regclass('public.profile_photos');"
```

Use a senha solicitada interativamente. Confirme que a consulta retorna `profile_photos`. A migração é aditiva; no rollback da aplicação, mantenha a tabela e as fotos.

## 4. Construir e publicar a imagem do backend

Confirme que a conta tem permissão de escrita no Docker Hub `ryliima/imperio-dog-api`. Use uma tag imutável do commit da branch:

```powershell
$tag = (git rev-parse --short HEAD).Trim()
docker login --username ryliima
docker build --pull -t "ryliima/imperio-dog-api:$tag" .
docker push "ryliima/imperio-dog-api:$tag"
```

O login deve ser interativo (ou usar o gerenciador de credenciais configurado); não passe tokens como argumentos. O `Dockerfile` compila com Java 21 e executa como usuário sem privilégios. Verifique a imagem/tag no registry antes de atualizar o Container App.

## 5. Atualizar o Container App existente e validar

Confirme subscription, resource group e Container App antes do comando. O comando atualiza a imagem do recurso existente; não cria outro app.

```powershell
az containerapp show --resource-group imperio-dog-rg --name imperio-dog-api --query "{name:name,environment:properties.environmentId,image:properties.template.containers[0].image}" --output yaml
az containerapp update --resource-group imperio-dog-rg --name imperio-dog-api --image "ryliima/imperio-dog-api:$tag"
az containerapp revision list --resource-group imperio-dog-rg --name imperio-dog-api --output table
Invoke-RestMethod https://imperio-dog-api.kindwater-77f7be6b.brazilsouth.azurecontainerapps.io/actuator/health
```

Verifique logs/revisão, health check, login e contratos da API. Teste upload, recuperação, substituição e remoção com uma conta de teste; confirme autorização entre dois tutores sem expor imagens privadas. Não use dados reais para testes.

## 6. Publicar o frontend Vercel existente

Mantenha o projeto, URL e QR Code atuais. Confirme na equipe `ryliimas-projects` que o projeto Vercel existente `imperio-dog` permanece com Root Directory `mobile/`, comando de build `npm run build`, saída `dist` e variável `EXPO_PUBLIC_API_URL` apontando para a API atual. Não crie outro projeto nem altere a URL pública.

Depois de validar a API e obter autorização:

```powershell
npx vercel whoami
npx vercel --prod
```

Execute o CLI a partir da raiz do repositório, não de `mobile/`; confirme que a conta/projeto vinculados são os existentes antes de confirmar qualquer prompt de produção.

## 7. Rollback

Se a nova revisão falhar, reverta a aplicação para a última imagem comprovadamente funcional, sem apagar a tabela de fotos nem alterar dados:

```powershell
az containerapp revision list --resource-group imperio-dog-rg --name imperio-dog-api --output table
az containerapp update --resource-group imperio-dog-rg --name imperio-dog-api --image "ryliima/imperio-dog-api:1e471ea"
```

Confirme o health check e o login após o rollback. Reverta o frontend pela interface de deployments do projeto Vercel existente para um deployment anterior conhecido como funcional. Preserve o backup até a validação do novo release e o fim da janela de rollback. Não restaure um dump sobre o banco de produção sem uma decisão operacional explícita: a migração é aditiva e o rollback normal é apenas da aplicação.

## Variáveis e segurança

- Backend: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS` e as configurações já utilizadas pelo ambiente, incluindo C6. Preserve os valores atuais e não copie segredos para o repositório.
- Frontend: `EXPO_PUBLIC_API_URL` permanece com a URL atual da API; o token JWT é enviado pela camada existente de requisições.
- PostgreSQL: valide conectividade TLS, privilégios para criar a tabela/índices e espaço disponível antes da migração.
- Não altere configurações de C6 Bank, não execute transações bancárias e não faça deploy até ter aprovação.
