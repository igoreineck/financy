# Tarefa 03 — It must be possible to create a transaction

> Origin: line 60 of the "Tarefas" section in `requisitos.md`.
> Branch: `feat/03-criar-transacao`. Workflow in [`CLAUDE.md`](../CLAUDE.md#workflow-per-tarefa).

## Goal

Let the authenticated user record a transaction (income or expense) linked to one of their categories.

## GraphQL surface

```graphql
enum TransactionType {
  INCOME
  EXPENSE
}

input CreateTransactionInput {
  description: String!
  amount: Int!                # cents — e.g. R$12,34 → 1234
  type: TransactionType!
  occurredAt: DateTime!
  categoryId: ID!
}

type Mutation {
  createTransaction(data: CreateTransactionInput!): TransactionModel!
}
```

## Files to add or change

### Prisma
- `prisma/schema.prisma` — add (SQLite stores the enum as `String`):
  ```prisma
  model Transaction {
    id          String   @id @default(uuid())
    description String
    amount      Int          // cents
    type        String       // 'INCOME' | 'EXPENSE'
    occurredAt  DateTime
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt

    userId     String
    user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

    categoryId String
    category   Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  }
  ```
- Run `pnpm migrate --name add-transaction`.

### GraphQL surface
- `src/graphql/models/transaction.model.ts` — `@ObjectType TransactionModel` with all fields. `registerEnumType(TransactionType, { name: 'TransactionType' })` at the top of the file (or in `src/graphql/models/transaction-type.enum.ts`).
- `src/graphql/inputs/transaction.input.ts` — `CreateTransactionInput`.
- `src/graphql/resolvers/transaction.resolver.ts` — `@Resolver(() => TransactionModel) @UseMiddleware(IsAuth)`. Mutation `createTransaction(@Arg('data'), @GqlUser() user)` that delegates to `createTransaction()`.

### Business logic
- `src/app/transactions/create-transaction.ts` — `export async function createTransaction(input, userId)`:
  1. `prisma.category.findFirst({ where: { id: input.categoryId, userId } })` — if empty, throws `Category not found`.
  2. `prisma.transaction.create({ data: { ...input, userId } })`.

### Wiring
- `src/infra/http/server.ts` — register `TransactionResolver` in `buildSchema`.

## Authorization

See [02 — Per-user scoping](./02-escopo-por-usuario.md). Critical points:

- `@UseMiddleware(IsAuth)` on the resolver.
- `userId` comes from `@GqlUser()`, **never** from the input.
- `categoryId` revalidated against `userId` before the insert (protection against cross-user IDOR).

## Testing

- `src/app/transactions/create-transaction.spec.ts`
  - [x] creates a transaction with valid input and a category owned by the user.
  - [x] `amount` is stored as an integer in cents.
  - [x] another user's `categoryId` throws `Category not found` (same message as a nonexistent id).
  - [x] nonexistent `categoryId` throws `Category not found`.
- `src/graphql/resolvers/transaction.resolver.spec.ts` (integration)
  - [x] `createTransaction` mutation with a valid token creates and returns the object.
  - [x] no token → authentication error.
  - [x] `type` only accepts `INCOME`/`EXPENSE` (schema error for other values).
- Update `src/test/setup.ts` to `await prisma.transaction.deleteMany()` before `prisma.category.deleteMany()` (order matters because of the FK).

## Acceptance criteria

- [x] Creating a valid transaction returns the object with `id`, `category` (resolved via a future FieldResolver), `user`.
- [x] No JWT → `User not authenticated!`.
- [x] Someone else's `categoryId` → `Category not found`.
- [x] `pnpm check` + `npx tsc --noEmit` + `pnpm test` green.

## Depends on

- [07 — Create category](./07-criar-categoria.md) — FK target.
- [01 — Create account and log in](./01-criar-conta-e-login.md).
- [02 — Per-user scoping](./02-escopo-por-usuario.md).

## Out of scope

- Recurrence.
- Tags / attachments.
- Multiple categories per transaction.
- Currency conversion.
