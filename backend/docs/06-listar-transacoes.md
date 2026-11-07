# Tarefa 06 — It must be possible to list all transactions

> Origin: line 63 of the "Tarefas" section in `requisitos.md`.
> Branch: `feat/06-listar-transacoes`.

## Goal

List all of the user's own transactions, with the associated category.

## GraphQL surface

```graphql
type Query {
  listTransactions: [TransactionModel!]!
}
```

`TransactionModel` resolves `category: CategoryModel!` via a `FieldResolver`.

## Files to add or change

- `src/app/transactions/list-transactions.ts` — `export async function listTransactions(userId)`:
  ```ts
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { occurredAt: 'desc' },
  })
  ```
- `src/app/transactions/find-transaction-category.ts` (or reuse `list-categories` / an inline helper in the resolver) — for the FieldResolver.
- `src/graphql/resolvers/transaction.resolver.ts` — add:
  - `@Query(() => [TransactionModel]) listTransactions(@GqlUser() user)`.
  - `@FieldResolver(() => CategoryModel) category(@Root() tx: TransactionModel)` — looks up by `tx.categoryId` (no `userId` in the `where` because `tx` was already scoped by the parent query).

## Authorization

See [02 — Per-user scoping](./02-escopo-por-usuario.md). The `findMany` **must** have `where: { userId }`. The FieldResolver is safe because it only receives already-scoped transactions.

## Testing

- `src/app/transactions/list-transactions.spec.ts`
  - [x] returns only the authenticated user's transactions (create transactions for A and B, list as A, ensure B's don't show up).
  - [x] `occurredAt` descending order.
  - [x] a user with no transactions gets `[]`.
- `src/graphql/resolvers/transaction.resolver.spec.ts`
  - [x] query returns a populated list with `category` resolved.
  - [x] no token → authentication error.

## Acceptance criteria

- [x] `listTransactions` returns only the authenticated user's transactions.
- [x] Order: `occurredAt` desc.
- [x] `category` resolved with name/color/icon.
- [x] Empty → `[]`.
- [x] No JWT → `User not authenticated!`.
- [x] Suite green.

## Depends on

- [03 — Create transaction](./03-criar-transacao.md).
- [07 — Create category](./07-criar-categoria.md) (for the FieldResolver).
- [01 — Create account and log in](./01-criar-conta-e-login.md).
- [02 — Per-user scoping](./02-escopo-por-usuario.md).

## Out of scope

- Pagination / cursor.
- Filters (category, type, date range).
- Text search.
- Aggregations (totals, balance).
