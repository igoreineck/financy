# Tarefa 02 — The user can only see and manage the transactions and categories they created

> Origin: line 59 of the "Tarefas" section in `requisitos.md`.
> Branch: `feat/02-escopo-por-usuario` (optional — this tarefa can ship as part of the 03 or 07 PR if there's nothing concrete to deliver yet).

## Goal

Cross-cutting rule: each user only sees and modifies their own data. This tarefa introduces no endpoint of its own — it defines the invariant that tarefas 03–10 implement.

## GraphQL surface

Introduces no types, queries, or mutations of its own.

## Invariant to implement in the other tarefas

In **every** resolver that reads or writes `Category` or `Transaction`:

1. Class or method decorated with `@UseMiddleware(IsAuth)`.
2. The resolver receives the authenticated user via `@GqlUser() user: UserModel`.
3. **Every** call to `prisma.category.*` or `prisma.transaction.*` includes `where: { ..., userId: user.id }`.
4. Update/delete operations use `prisma.<model>.findFirst({ where: { id, userId } })` **before** the mutation, throwing "not found" if empty. Never `findUnique({ where: { id } })` + an in-memory check; never a direct `update({ where: { id } })`.
5. In `createTransaction`, if the input carries a `categoryId`, **revalidate** that the category belongs to the same user before the insert.
6. `FieldResolver`s that load relations (e.g. `Transaction.category`) may use `findUnique` — the parent was already scoped by `userId`, so the relation necessarily belongs to the same user.
7. **Error messages don't leak existence**: "Category not found" must be identical whether the id doesn't exist or belongs to another user.

## Files to add or change

No files of its own. The concrete implementations live in the tarefas:

- [03 — Create transaction](./03-criar-transacao.md)
- [04 — Delete transaction](./04-deletar-transacao.md)
- [05 — Edit transaction](./05-editar-transacao.md)
- [06 — List transactions](./06-listar-transacoes.md)
- [07 — Create category](./07-criar-categoria.md)
- [08 — Delete category](./08-deletar-categoria.md)
- [09 — Edit category](./09-editar-categoria.md)
- [10 — List categories](./10-listar-categorias.md)

## Testing

This tarefa **has no tests of its own**. Each tarefa 03–10 ships the IDOR/ownership test described in CLAUDE.md > Testing > "Smoke test for ownership". Suggested shared helper, created by the first tarefa that needs it:

- `src/test/helpers/create-test-user.ts` — `export async function createTestUser(overrides?)` that calls `registerUser` with fake data (`@faker-js/faker`) and returns `{ user, token }`. Used by all resolver/service tests.

## Acceptance criteria

Validated in tarefas 03–10. The matrix:

- [x] User A doesn't see B's transactions/categories in any list/query.
- [x] User A can't update/delete B's transaction or category (even with the correct id) — "not found" error, **same message** as a nonexistent id.
- [x] User A can't create a transaction referencing B's `categoryId`.
- [x] Protected resolver without a token / with an invalid token → `User not authenticated!`.

## Depends on

- [01 — Create account and log in](./01-criar-conta-e-login.md).

## Out of scope

- Roles / permissions beyond "resource owner".
- Soft delete / auditing.
- Sharing between users.
