# Tarefa 05 — It must be possible to edit a transaction

> Origin: line 62 of the "Tarefas" section in `requisitos.md`.
> Branch: `feat/05-editar-transacao`.

## Goal

Update fields of an existing transaction owned by the user.

## GraphQL surface

```graphql
input UpdateTransactionInput {
  description: String
  amount: Int
  type: TransactionType
  occurredAt: DateTime
  categoryId: ID
}

type Mutation {
  updateTransaction(id: ID!, data: UpdateTransactionInput!): TransactionModel!
}
```

All optional — only the fields sent are changed.

## Files to add or change

- `src/graphql/inputs/transaction.input.ts` — add `UpdateTransactionInput` (same shape as create, all `@Field({ nullable: true })`).
- `src/app/transactions/update-transaction.ts` — `export async function updateTransaction(id, data, userId)`:
  1. `prisma.transaction.findFirst({ where: { id, userId } })` → if empty, throws `Transaction not found`.
  2. If `data.categoryId` was sent and differs from the current one: `prisma.category.findFirst({ where: { id: data.categoryId, userId } })` → if empty, throws `Category not found`.
  3. `prisma.transaction.update({ where: { id }, data })`.
- `src/graphql/resolvers/transaction.resolver.ts` — add the `updateTransaction(@Arg('id'), @Arg('data'), @GqlUser() user)` mutation.

## Authorization

See [02 — Per-user scoping](./02-escopo-por-usuario.md). Two points:

1. The target transaction belongs to the user.
2. The new `categoryId` (if sent) also belongs to the user — otherwise an attacker could "move" their own transaction into someone else's category.

## Testing

- `src/app/transactions/update-transaction.spec.ts`
  - [x] partial update (only `description`) changes only the field sent.
  - [x] `amount: 0` is accepted (distinguish from "not sent").
  - [x] update with another user's `id` → `Transaction not found`.
  - [x] update with another user's `categoryId` → `Category not found`.
  - [x] `updatedAt` is updated.
- `src/graphql/resolvers/transaction.resolver.spec.ts`
  - [x] mutation returns the updated object.
  - [x] user A can't edit B's transaction.

## Acceptance criteria

- [x] Partial update preserves fields not sent.
- [x] `amount: 0` accepted.
- [x] Cross-user update → `Transaction not found`.
- [x] Changing `categoryId` to someone else's category → `Category not found`.
- [x] Suite green.

## Depends on

- [03 — Create transaction](./03-criar-transacao.md).
- [01 — Create account and log in](./01-criar-conta-e-login.md).
- [02 — Per-user scoping](./02-escopo-por-usuario.md).

## Out of scope

- Version history.
- Batch editing.
