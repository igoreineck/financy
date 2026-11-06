# Tarefa 04 — It must be possible to delete a transaction

> Origin: line 61 of the "Tarefas" section in `requisitos.md`.
> Branch: `feat/04-deletar-transacao`.

## Goal

Delete one of the user's own transactions by id.

## GraphQL surface

```graphql
type Mutation {
  deleteTransaction(id: ID!): Boolean!
}
```

Returns `true` on success; errors if the transaction doesn't exist or belongs to another user.

## Files to add or change

- `src/app/transactions/delete-transaction.ts` — `export async function deleteTransaction(id, userId)`:
  ```ts
  const existing = await prisma.transaction.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('Transaction not found')
  await prisma.transaction.delete({ where: { id } })
  ```
  > Use `findFirst({ where: { id, userId } })` (not `findUnique` + an in-memory check) to guarantee the filter is part of the query.
- `src/graphql/resolvers/transaction.resolver.ts` — add the `deleteTransaction(@Arg('id'), @GqlUser() user)` mutation, which delegates and returns `true`.

## Authorization

See [02 — Per-user scoping](./02-escopo-por-usuario.md). Critical case for IDOR.

## Testing

- `src/app/transactions/delete-transaction.spec.ts`
  - [x] deleting your own: the transaction disappears from `prisma.transaction.findMany`.
  - [x] nonexistent id → `Transaction not found`.
  - [x] another user's id → `Transaction not found` (same message).
- `src/graphql/resolvers/transaction.resolver.spec.ts`
  - [x] mutation returns `true` on success.
  - [x] user A can't delete B's transaction.

## Acceptance criteria

- [x] A valid delete returns `true` and the row disappears from `listTransactions`.
- [x] Nonexistent id → `Transaction not found`.
- [x] Another user's id → `Transaction not found` (don't leak existence).
- [x] No JWT → `User not authenticated!`.
- [x] Suite green.

## Depends on

- [03 — Create transaction](./03-criar-transacao.md).
- [01 — Create account and log in](./01-criar-conta-e-login.md).
- [02 — Per-user scoping](./02-escopo-por-usuario.md).

## Out of scope

- Soft delete / trash.
- Bulk delete.
- Undo.
