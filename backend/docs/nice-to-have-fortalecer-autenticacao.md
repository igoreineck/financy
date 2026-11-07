# Nice to have — Harden authentication (rotation, revocation, and refresh tokens)

> Origin: "Nice to have (future)" section in `requisitos.md`. Not part of the mandatory scope of tarefas 01–10.
> Suggested branch: `feat/nth-fortalecer-autenticacao` when it gets picked up.

## Goal

Harden the project's JWT authentication flow — currently stateless with no revocation mechanism — by introducing short expiration, persisted refresh tokens, and/or credential versioning.

## Current state

Pure stateless. The backend signs and forgets — there's no sessions table, no blocklist, and no refresh token.

- `signJwt` in `src/shared/jwt.ts:14` issues a token with a default `expiresIn` of `'1d'`.
- `registerUser` (`src/app/auth/register-user.ts:40`) and `loginUser` (`src/app/auth/login-user.ts`) return `{ token, user }`; the server doesn't persist the token.
- `buildContext` (`src/graphql/context.ts:25-37`) reads `Authorization: Bearer <token>`, calls `verifyJwt`, and exposes `{ user, token, authError }`. Verification **doesn't hit the database** — only signature + expiration against `env.JWT_SECRET`.
- The Prisma `User` only has `id`, `name`, `email`, `password` — no version/session field.

### Implications that motivate this tarefa

- **Backend logout is a no-op.** There's no way to invalidate a specific token before its TTL — the frontend can only delete it from local storage; the JWT stays valid until it expires.
- **Changing the password doesn't log out old sessions.** The token doesn't reference a credential version.
- **The "panic button" is blunt.** The only way to invalidate everything in circulation is to rotate `JWT_SECRET`, which kills every session for every user.

## Proposal

Three paths, in increasing order of effort. They can be combined — pick based on appetite when the tarefa is picked up.

### Option A — `tokenVersion` on `User` (least effort, focused gain)

Add a versioned integer on `User`; the JWT includes that version in its payload; `verifyJwt` (or a step after it in `buildContext`) compares it with the current value in the DB.

- Solves "changing the password logs out old sessions" without a refresh token.
- Adds one `prisma.user.findUnique` query per request — acceptable given the project's volume.
- Doesn't give per-session revocation (all sessions drop together when the version bumps).

### Option B — short TTL + persisted refresh token (medium effort, industry standard)

- `signJwt` switches to `'15m'` (access token).
- New table `RefreshToken { id, userId, tokenHash, expiresAt, revokedAt, createdAt, replacedById? }` (mind the FK and an index on `userId`).
- New mutations: `refreshToken(input: { refreshToken: String! }): AuthOutput!`, `logout(input: { refreshToken: String! }): Boolean!`.
- Login/register issue **two** tokens (short access + long refresh, e.g. 30d). The refresh is rotated on every use (`replacedById`); reusing an already-consumed refresh invalidates the whole chain (token theft detection).
- Logout sets `revokedAt`. It doesn't touch the access token — that stays valid until it expires, but since it expires in 15min the impact is small.

### Option C — Redis blocklist (high operational cost)

Keeps the 1d stateless JWT but checks Redis on every request to see whether the `jti` was revoked. Solves immediate revocation, but:
- becomes stateful (loses the advantage of a pure JWT);
- introduces Redis into the infra (it doesn't exist today);
- disproportionate for the project's scope.

**Recommendation:** Option A as the first step, Option B if there's appetite for the full flow. Don't do C for now.

## GraphQL surface

Varies with the chosen option.

### Common to A and B

```graphql
type Mutation {
  logout: Boolean!
}
```

### Additional in Option B

```graphql
input RefreshTokenInput {
  refreshToken: String!
}

type AuthOutput {
  token: String!
  refreshToken: String!   # new field — register/login/refresh
  user: UserModel!
}

type Mutation {
  refreshToken(data: RefreshTokenInput!): AuthOutput!
  logout(data: RefreshTokenInput!): Boolean!
}
```

**Breaking change to the `AuthOutput` shape** — coordinate with the frontend.

## Files to add or change

### Option A

- `prisma/schema.prisma` — add `tokenVersion Int @default(0)` to `User`. Migrate with `pnpm migrate --name add-user-token-version`.
- `src/shared/jwt.ts` — `JwtPayload` gains `tokenVersion`.
- `src/app/auth/register-user.ts`, `src/app/auth/login-user.ts` — include `tokenVersion: 0` in the payload (or read it from the user).
- `src/graphql/context.ts` — after `verifyJwt`, compare the payload's `tokenVersion` with the DB value; mismatch → `authError = 'invalid'`.
- New function `src/app/auth/bump-token-version.ts` called by `changePassword`/`logout`.
- `src/graphql/resolvers/auth.resolver.ts` — `logout` mutation that increments `tokenVersion`.

### Option B (builds on A or replaces it)

- `prisma/schema.prisma` — `RefreshToken` model.
- `src/shared/jwt.ts` — split into `signAccessToken('15m')` and `signRefreshToken('30d')` with distinct payloads; the refresh carries a `jti`.
- `src/app/auth/issue-tokens.ts` — generates the pair, persists the refresh hash.
- `src/app/auth/refresh-token.ts` — validates, detects reuse, rotates.
- `src/app/auth/logout.ts` — sets `revokedAt`.
- `src/graphql/outputs/auth.output.ts` — add `refreshToken: String!`.
- `src/graphql/inputs/auth.input.ts` — `RefreshTokenInput`.
- `src/graphql/resolvers/auth.resolver.ts` — `refreshToken` and `logout` mutations.
- `src/test/setup.ts` — `prisma.refreshToken.deleteMany()` in `beforeEach`.

## Testing

### Option A

- `src/app/auth/bump-token-version.spec.ts` — increments the version; verifies that tokens issued earlier stop validating.
- `src/graphql/resolvers/auth.resolver.spec.ts` (extend) — `logout` invalidates the same user's existing tokens on subsequent calls; **other** users' tokens aren't affected.

### Option B

- `src/app/auth/refresh-token.spec.ts`
  - happy path: rotates, marks the old one's `replacedById`.
  - expired refresh → `Refresh token expired!`.
  - revoked refresh → `Invalid refresh token!`.
  - **reuse of an already-rotated refresh** → revokes that user's whole chain (theft detection).
- `src/app/auth/logout.spec.ts`
  - sets `revokedAt`; a subsequent refresh with the same token fails.
  - A's logout doesn't affect B's refresh tokens.
- `src/graphql/resolvers/auth.resolver.spec.ts` — integration of the new mutations; assert on the `AuthOutput` shape with `refreshToken`.

## Acceptance criteria

### Option A

- [ ] `User.tokenVersion` exists and migrates cleanly.
- [ ] `logout` mutation increments the authenticated user's `tokenVersion`.
- [ ] A token issued before `logout` returns `User not authenticated!` on protected resolvers.
- [ ] Other users' tokens remain valid.
- [ ] `pnpm check` clean; `npx tsc --noEmit` clean; `pnpm test` green.

### Option B

- [ ] `register` and `login` return `{ token, refreshToken, user }`.
- [ ] `token` (access) expires in 15min; `refreshToken` expires in 30 days.
- [ ] `refreshToken` mutation rotates the refresh (the old one becomes invalid) and issues a new pair.
- [ ] Reusing an already-rotated refresh invalidates that user's whole chain.
- [ ] `logout` revokes the refresh; a subsequent refresh attempt fails.
- [ ] `pnpm check`, `npx tsc --noEmit`, `pnpm test` all clean.

## Depends on

- [01 — Create account and log in](./01-criar-conta-e-login.md) (establishes the current flow this tarefa hardens).

## Out of scope

- Password recovery / email verification.
- Login / refresh rate limiting.
- Roles and permissions beyond "resource owner".
- 2FA / TOTP.
- Redis blocklist (Option C) — discarded as disproportionate.
