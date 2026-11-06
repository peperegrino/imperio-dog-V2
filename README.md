
# Imperio Dog

## Aplicativo mobile e web

O aplicativo Expo fica em `mobile/`. Para executar a versão web, configure
`EXPO_PUBLIC_API_URL` no arquivo `mobile/.env` com a URL base do backend, por
exemplo `EXPO_PUBLIC_API_URL=http://localhost:8080`. Em seguida, execute dentro
de `mobile/`:

```sh
npx expo start --web
```

O endpoint de autenticação esperado é `POST /auth/login`, com `email` e
`password` no corpo. A resposta precisa conter `token` (ou `accessToken`) e
`role` (ou `user.role`). Papéis `ADMIN`/`ROLE_ADMIN` abrem a área Admin; os
papéis `USER`, `TUTOR`, `CLIENT` e `CUSTOMER` (com ou sem prefixo `ROLE_`)
abrem a Home.

O cadastro público usa `POST /auth/register` com `name`, `email` e `password`.
O backend deve atribuir o papel padrão de usuário; papéis administrativos não
são selecionáveis no cadastro.

## Integracao com o backend

Frontend nesta branch; API Java na branch `backend`. Consulte [execucao e contratos](docs/INTEGRATION.md).
