# Nice to have — Fortalecer autenticação (rotação, revogação e refresh tokens)

> Origem: seção "Nice to have (futuro)" em `requisitos.md`. Não faz parte do escopo obrigatório das tarefas 01–10.
> Branch sugerida: `feat/nth-fortalecer-autenticacao` quando for atacar.

## Objetivo

Endurecer o fluxo de autenticação de JWT do projeto, hoje stateless e sem mecanismo de revogação, introduzindo expiração curta, refresh tokens persistidos e/ou versionamento de credencial.

## Estado atual

Stateless puro. O backend assina e esquece — não há tabela de sessões, blocklist nem refresh token.

- `signJwt` em `src/shared/jwt.ts:14` emite token com `expiresIn` default `'1d'`.
- `registerUser` (`src/app/auth/register-user.ts:40`) e `loginUser` (`src/app/auth/login-user.ts`) devolvem `{ token, user }`; o servidor não persiste o token.
- `buildContext` (`src/graphql/context.ts:25-37`) lê `Authorization: Bearer <token>`, chama `verifyJwt` e expõe `{ user, token, authError }`. Verificação **não consulta o banco** — só assinatura + expiração contra `env.JWT_SECRET`.
- O `User` no Prisma só tem `id`, `name`, `email`, `password` — nenhum campo de versão/sessão.

### Implicações que motivam essa tarefa

- **Logout no backend é no-op.** Não dá pra invalidar um token específico antes do TTL — o frontend só consegue apagar do storage local; o JWT continua válido até expirar.
- **Trocar senha não desloga sessões antigas.** O token não referencia versão de credencial.
- **"Botão de pânico" é grosso.** A única forma de invalidar tudo em circulação é trocar `JWT_SECRET`, o que mata todas as sessões de todos os usuários.

## Proposta

Três caminhos, em ordem crescente de esforço. Podem ser combinados — escolher conforme o apetite quando a tarefa for atacada.

### Opção A — `tokenVersion` no `User` (menor esforço, ganho focado)

Adiciona um inteiro versionado no `User`; o JWT inclui essa versão no payload; `verifyJwt` (ou um passo após ele em `buildContext`) compara com o valor atual em DB.

- Resolve "trocar senha desloga sessões antigas" sem refresh token.
- Adiciona uma consulta `prisma.user.findUnique` por request — aceitável dado o volume do projeto.
- Não dá revogação por sessão (todas caem juntas quando a versão sobe).

### Opção B — TTL curto + refresh token persistido (médio esforço, padrão da indústria)

- `signJwt` passa a usar `'15m'` (access token).
- Nova tabela `RefreshToken { id, userId, tokenHash, expiresAt, revokedAt, createdAt, replacedById? }` (cuidar de FK e índice em `userId`).
- Mutations novas: `refreshToken(input: { refreshToken: String! }): AuthOutput!`, `logout(input: { refreshToken: String! }): Boolean!`.
- Login/register emitem **dois** tokens (access curto + refresh longo, ex.: 30d). Refresh é rotacionado a cada uso (`replacedById`); reuso de refresh já consumido invalida toda a cadeia (token theft detection).
- Logout marca `revokedAt`. Não toca no access token — ele continua válido até expirar, mas como expira em 15min o impacto é pequeno.

### Opção C — Blocklist em Redis (custo operacional alto)

Mantém o JWT stateless de 1d mas consulta um Redis a cada request pra ver se o `jti` foi revogado. Resolve revogação imediata mas:
- vira stateful (perde a vantagem do JWT puro);
- introduz Redis na infra (não existe hoje);
- desproporcional pro escopo do projeto.

**Recomendação:** Opção A como passo inicial, Opção B se houver vontade de fazer o fluxo completo. Não fazer C por enquanto.

## GraphQL surface

Variável conforme a opção escolhida.

### Comum a A e B

```graphql
type Mutation {
  logout: Boolean!
}
```

### Adicional na Opção B

```graphql
input RefreshTokenInput {
  refreshToken: String!
}

type AuthOutput {
  token: String!
  refreshToken: String!   # novo campo — register/login/refresh
  user: UserModel!
}

type Mutation {
  refreshToken(data: RefreshTokenInput!): AuthOutput!
  logout(data: RefreshTokenInput!): Boolean!
}
```

**Breaking change na shape de `AuthOutput`** — coordenar com o frontend.

## Files to add or change

### Opção A

- `prisma/schema.prisma` — adicionar `tokenVersion Int @default(0)` em `User`. Migrar com `pnpm migrate --name add-user-token-version`.
- `src/shared/jwt.ts` — `JwtPayload` ganha `tokenVersion`.
- `src/app/auth/register-user.ts`, `src/app/auth/login-user.ts` — incluir `tokenVersion: 0` no payload (ou ler do user).
- `src/graphql/context.ts` — após `verifyJwt`, comparar `tokenVersion` do payload com o valor em DB; mismatch → `authError = 'invalid'`.
- Nova função `src/app/auth/bump-token-version.ts` chamada por `changePassword`/`logout`.
- `src/graphql/resolvers/auth.resolver.ts` — mutation `logout` que incrementa `tokenVersion`.

### Opção B (acumula sobre A ou substitui)

- `prisma/schema.prisma` — modelo `RefreshToken`.
- `src/shared/jwt.ts` — separar `signAccessToken('15m')` e `signRefreshToken('30d')` com payloads distintos; refresh carrega `jti`.
- `src/app/auth/issue-tokens.ts` — gera o par, persiste hash do refresh.
- `src/app/auth/refresh-token.ts` — valida, detecta reuso, rotaciona.
- `src/app/auth/logout.ts` — marca `revokedAt`.
- `src/graphql/outputs/auth.output.ts` — adicionar `refreshToken: String!`.
- `src/graphql/inputs/auth.input.ts` — `RefreshTokenInput`.
- `src/graphql/resolvers/auth.resolver.ts` — mutations `refreshToken` e `logout`.
- `src/test/setup.ts` — `prisma.refreshToken.deleteMany()` no `beforeEach`.

## Testing

### Opção A

- `src/app/auth/bump-token-version.spec.ts` — incrementa versão; verifica que tokens emitidos antes deixam de validar.
- `src/graphql/resolvers/auth.resolver.spec.ts` (extender) — `logout` invalida tokens existentes do mesmo usuário em chamadas subsequentes; tokens de **outros** usuários não são afetados.

### Opção B

- `src/app/auth/refresh-token.spec.ts`
  - happy path: rotaciona, marca antigo `replacedById`.
  - refresh expirado → `Refresh token expirado!`.
  - refresh revogado → `Refresh token inválido!`.
  - **reuso de refresh já rotacionado** → revoga toda a cadeia daquele usuário (detecção de roubo).
- `src/app/auth/logout.spec.ts`
  - marca `revokedAt`; refresh subsequente com mesmo token falha.
  - logout de A não afeta refresh tokens de B.
- `src/graphql/resolvers/auth.resolver.spec.ts` — integração das mutations novas; assert no formato de `AuthOutput` com `refreshToken`.

## Acceptance criteria

### Opção A

- [ ] `User.tokenVersion` existe e migra limpo.
- [ ] Mutation `logout` incrementa `tokenVersion` do usuário autenticado.
- [ ] Token emitido antes do `logout` retorna `Usuário não autenticado!` em resolvers protegidos.
- [ ] Tokens de outros usuários permanecem válidos.
- [ ] `pnpm check` limpo; `npx tsc --noEmit` limpo; `pnpm test` verde.

### Opção B

- [ ] `register` e `login` devolvem `{ token, refreshToken, user }`.
- [ ] `token` (access) expira em 15min; `refreshToken` expira em 30 dias.
- [ ] `refreshToken` mutation rotaciona o refresh (antigo vira inválido) e emite novo par.
- [ ] Reuso de refresh já rotacionado invalida toda a cadeia daquele usuário.
- [ ] `logout` revoga o refresh; tentativa de refresh subsequente falha.
- [ ] `pnpm check`, `npx tsc --noEmit`, `pnpm test` todos limpos.

## Depends on

- [01 — Criar conta e login](./01-criar-conta-e-login.md) (estabelece o fluxo atual que esta tarefa endurece).

## Out of scope

- Recuperação de senha / verificação de email.
- Rate limiting de login / refresh.
- Roles e permissões além de "dono do recurso".
- 2FA / TOTP.
- Blocklist em Redis (Opção C) — descartada por desproporcionalidade.
