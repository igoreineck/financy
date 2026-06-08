# Tarefa 01 — O usuário pode criar uma conta e fazer login

> Origem: linha 58 da seção "Tarefas" em `requisitos.md`.
> Branch: `feat/01-criar-conta-e-login`. Workflow geral em [`CLAUDE.md`](../CLAUDE.md#workflow-per-tarefa).

## Objetivo

Permitir cadastro com email/senha e emissão de um JWT no login. Estabelece toda a infraestrutura de autenticação que as tarefas seguintes consomem.

## GraphQL surface

```graphql
input RegisterInput {
  name: String!
  email: String!
  password: String!
}

input LoginInput {
  email: String!
  password: String!
}

type AuthOutput {
  token: String!
  user: UserModel!
}

type Mutation {
  register(data: RegisterInput!): AuthOutput!
  login(data: LoginInput!): AuthOutput!
}
```

> **Divergência da referência:** o repo `ftr-pos-360-mindshare` retorna `{ token, refreshToken, user }` mas emite os dois com a mesma expiração — não é um refresh real. Aqui retornamos só `token`.

## Files to add or change

### Prisma
- `prisma/schema.prisma` — adicionar:
  ```prisma
  model User {
    id        String   @id @default(uuid())
    name      String
    email     String   @unique
    password  String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  ```
- Rodar `pnpm migrate --name add-user`.

### GraphQL surface (classes — TypeGraphQL exige)
- `src/graphql/models/user.model.ts` — `@ObjectType UserModel`. **Não expor** `password` no GraphQL.
- `src/graphql/inputs/auth.input.ts` — `RegisterInput`, `LoginInput`.
- `src/graphql/outputs/auth.output.ts` — `AuthOutput { token, user }`.
- `src/graphql/resolvers/auth.resolver.ts` — `@Resolver` com `register` e `login` mutations; delega às funções em `src/app/auth/`.
- `src/graphql/context.ts` — `buildContext({ req })`: lê `Authorization: Bearer <token>`, valida com `verifyJwt`, expõe `GraphqlContext = { user: string | undefined, token, req, res }`.
- `src/graphql/decorators/gql-user.decorator.ts` — `@GqlUser()` parameter decorator que busca o `User` completo via `prisma`.
- `src/graphql/middlewares/is-auth.middleware.ts` — `IsAuth` MiddlewareFn que lança erro se `!context.user`.

### Business logic (funções — brev.ly style)
- `src/app/auth/register-user.ts` — `export async function registerUser({ name, email, password })`:
  1. `prisma.user.findUnique({ where: { email } })` — se existir, lança `E-mail já cadastrado!`.
  2. `hashPassword(password)`.
  3. `prisma.user.create(...)`.
  4. Retorna `{ token: signJwt({ id, email }, '1d'), user }`.
- `src/app/auth/login-user.ts` — `export async function loginUser({ email, password })`:
  1. `prisma.user.findUnique({ where: { email } })` — se vazio, lança `Usuário não cadastrado!`.
  2. `comparePassword(password, user.password)` — se falso, lança `Senha inválida!`.
  3. Retorna `{ token, user }`.
- `src/shared/hash.ts` — `hashPassword`, `comparePassword` (bcrypt, salt 10).
- `src/shared/jwt.ts` — `signJwt`, `verifyJwt` lendo `env.JWT_SECRET`.

### Wiring
- `src/infra/http/server.ts` — registrar `AuthResolver` em `buildSchema`, passar `buildContext` em `expressMiddleware`, **remover** `HealthResolver` (e o arquivo `src/graphql/resolvers/health.resolver.ts`).

## Authorization

Esta tarefa **estabelece** o mecanismo. `register` e `login` são públicos; tudo a partir daqui usa `@UseMiddleware(IsAuth)` + `@GqlUser()`. Ver [`02-escopo-por-usuario.md`](./02-escopo-por-usuario.md).

## Testing (obrigatório — ver CLAUDE.md > Testing)

- `src/app/auth/register-user.spec.ts`
  - [ ] cria usuário e retorna `{ token, user }` com password hasheada (verificar bcrypt).
  - [ ] lança `E-mail já cadastrado!` quando email duplicado.
- `src/app/auth/login-user.spec.ts`
  - [ ] login com credenciais válidas retorna `token` e o user correto.
  - [ ] email inexistente lança `Usuário não cadastrado!`.
  - [ ] senha errada lança `Senha inválida!`.
- `src/shared/jwt.spec.ts`
  - [ ] `signJwt`/`verifyJwt` roundtrip preserva payload.
  - [ ] token expirado falha em `verifyJwt`.
- `src/graphql/resolvers/auth.resolver.spec.ts` (integration)
  - [ ] `mutation register` retorna `token` + `user` em GraphQL.
  - [ ] `mutation login` retorna `token` + `user` em GraphQL.
  - [ ] formato dos erros propagados é o esperado pelo Apollo.
- Atualizar `src/test/setup.ts` para incluir `await prisma.user.deleteMany()` em `beforeEach`.

## Acceptance criteria

- [ ] Mutation `register` cria usuário com senha hasheada (bcrypt, salt 10) e retorna `token` + `user`.
- [ ] Registro com email duplicado lança `E-mail já cadastrado!`.
- [ ] Mutation `login` com credenciais válidas retorna `token` + `user`.
- [ ] Login com email inexistente: `Usuário não cadastrado!`.
- [ ] Login com senha errada: `Senha inválida!`.
- [ ] JWT decodificável com `env.JWT_SECRET`, payload `{ id, email }`, expiração 1 dia.
- [ ] Requisição com `Authorization: Bearer <token>` válido passa em resolvers protegidos; sem header ou token inválido lança `Usuário não autenticado!`.
- [ ] `pnpm check` limpo; `npx tsc --noEmit` limpo; `pnpm test` verde.

## Depends on

Nenhuma. Primeira tarefa a implementar.

## Out of scope

- Refresh tokens reais (divergência documentada acima).
- Recuperação de senha / verificação de email.
- Roles / permissões granulares.
- Rate limiting de login.
