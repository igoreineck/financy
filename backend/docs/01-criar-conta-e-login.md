# Tarefa 01 — The user can create an account and log in

> Origin: line 58 of the "Tarefas" section in `requisitos.md`.
> Branch: `feat/01-criar-conta-e-login`. General workflow in [`CLAUDE.md`](../CLAUDE.md#workflow-per-tarefa).

## Goal

Allow sign-up with email/password and issue a JWT on login. Establishes the whole authentication infrastructure that the following tarefas consume.

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

> **Divergence from the reference:** the `ftr-pos-360-mindshare` repo returns `{ token, refreshToken, user }` but issues both with the same expiration — it isn't a real refresh. Here we return only `token`.

## Files to add or change

### Prisma
- `prisma/schema.prisma` — add:
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
- Run `pnpm migrate --name add-user`.

### GraphQL surface (classes — required by TypeGraphQL)
- `src/graphql/models/user.model.ts` — `@ObjectType UserModel`. **Do not expose** `password` in GraphQL.
- `src/graphql/inputs/auth.input.ts` — `RegisterInput`, `LoginInput`.
- `src/graphql/outputs/auth.output.ts` — `AuthOutput { token, user }`.
- `src/graphql/resolvers/auth.resolver.ts` — `@Resolver` with `register` and `login` mutations; delegates to the functions in `src/app/auth/`.
- `src/graphql/context.ts` — `buildContext({ req })`: reads `Authorization: Bearer <token>`, validates it with `verifyJwt`, exposes `GraphqlContext = { user: string | undefined, token, req, res }`.
- `src/graphql/decorators/gql-user.decorator.ts` — `@GqlUser()` parameter decorator that fetches the full `User` via `prisma`.
- `src/graphql/middlewares/is-auth.middleware.ts` — `IsAuth` MiddlewareFn that throws if `!context.user`.

### Business logic (functions — brev.ly style)
- `src/app/auth/register-user.ts` — `export async function registerUser({ name, email, password })`:
  1. `prisma.user.findUnique({ where: { email } })` — if it exists, throws `Email already registered!`.
  2. `hashPassword(password)`.
  3. `prisma.user.create(...)`.
  4. Returns `{ token: signJwt({ id, email }, '1d'), user }`.
- `src/app/auth/login-user.ts` — `export async function loginUser({ email, password })`:
  1. `prisma.user.findUnique({ where: { email } })` — if empty, throws `User not registered!`.
  2. `comparePassword(password, user.password)` — if false, throws `Invalid password!`.
  3. Returns `{ token, user }`.
- `src/shared/hash.ts` — `hashPassword`, `comparePassword` (bcrypt, salt 10).
- `src/shared/jwt.ts` — `signJwt`, `verifyJwt` reading `env.JWT_SECRET`.

### Wiring
- `src/infra/http/server.ts` — register `AuthResolver` in `buildSchema`, pass `buildContext` to `expressMiddleware`, **remove** `HealthResolver` (and the `src/graphql/resolvers/health.resolver.ts` file).

## Authorization

This tarefa **establishes** the mechanism. `register` and `login` are public; everything from here on uses `@UseMiddleware(IsAuth)` + `@GqlUser()`. See [`02-escopo-por-usuario.md`](./02-escopo-por-usuario.md).

## Testing (mandatory — see CLAUDE.md > Testing)

- `src/app/auth/register-user.spec.ts`
  - [x] creates the user and returns `{ token, user }` with a hashed password (verify bcrypt).
  - [x] throws `Email already registered!` on duplicate email.
- `src/app/auth/login-user.spec.ts`
  - [x] login with valid credentials returns `token` and the correct user.
  - [x] unknown email throws `User not registered!`.
  - [x] wrong password throws `Invalid password!`.
- `src/shared/jwt.spec.ts`
  - [x] `signJwt`/`verifyJwt` roundtrip preserves the payload.
  - [x] expired token fails in `verifyJwt`.
- `src/graphql/resolvers/auth.resolver.spec.ts` (integration)
  - [x] `mutation register` returns `token` + `user` over GraphQL.
  - [x] `mutation login` returns `token` + `user` over GraphQL.
  - [x] propagated errors have the shape Apollo expects.
- Update `src/test/setup.ts` to include `await prisma.user.deleteMany()` in `beforeEach`.

## Acceptance criteria

- [x] `register` mutation creates a user with a hashed password (bcrypt, salt 10) and returns `token` + `user`.
- [x] Registering with a duplicate email throws `Email already registered!`.
- [x] `login` mutation with valid credentials returns `token` + `user`.
- [x] Login with unknown email: `User not registered!`.
- [x] Login with wrong password: `Invalid password!`.
- [x] JWT decodable with `env.JWT_SECRET`, payload `{ id, email }`, 1-day expiration.
- [x] A request with a valid `Authorization: Bearer <token>` passes protected resolvers; no header or an invalid token throws `User not authenticated!`.
- [x] `pnpm check` clean; `npx tsc --noEmit` clean; `pnpm test` green.

## Depends on

None. First tarefa to implement.

## Out of scope

- Real refresh tokens (divergence documented above).
- Password recovery / email verification.
- Roles / granular permissions.
- Login rate limiting.
