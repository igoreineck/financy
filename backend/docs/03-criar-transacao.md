# Tarefa 03 — Deve ser possível criar uma transação

> Origem: linha 60 da seção "Tarefas" em `requisitos.md`.
> Branch: `feat/03-criar-transacao`. Workflow em [`CLAUDE.md`](../CLAUDE.md#workflow-per-tarefa).

## Objetivo

Permitir ao usuário autenticado registrar uma transação (receita ou despesa) associada a uma categoria sua.

## GraphQL surface

```graphql
enum TransactionType {
  INCOME
  EXPENSE
}

input CreateTransactionInput {
  description: String!
  amount: Int!                # centavos — ex.: R$12,34 → 1234
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
- `prisma/schema.prisma` — adicionar (SQLite armazena o enum como `String`):
  ```prisma
  model Transaction {
    id          String   @id @default(uuid())
    description String
    amount      Int          // centavos
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
- Rodar `pnpm migrate --name add-transaction`.

### GraphQL surface
- `src/graphql/models/transaction.model.ts` — `@ObjectType TransactionModel` com todos os campos. `registerEnumType(TransactionType, { name: 'TransactionType' })` no topo do arquivo (ou em `src/graphql/models/transaction-type.enum.ts`).
- `src/graphql/inputs/transaction.input.ts` — `CreateTransactionInput`.
- `src/graphql/resolvers/transaction.resolver.ts` — `@Resolver(() => TransactionModel) @UseMiddleware(IsAuth)`. Mutation `createTransaction(@Arg('data'), @GqlUser() user)` que delega a `createTransaction()`.

### Business logic
- `src/app/transactions/create-transaction.ts` — `export async function createTransaction(input, userId)`:
  1. `prisma.category.findFirst({ where: { id: input.categoryId, userId } })` — se vazio, lança `Categoria não encontrada`.
  2. `prisma.transaction.create({ data: { ...input, userId } })`.

### Wiring
- `src/infra/http/server.ts` — registrar `TransactionResolver` em `buildSchema`.

## Authorization

Ver [02 — Escopo por usuário](./02-escopo-por-usuario.md). Pontos críticos:

- `@UseMiddleware(IsAuth)` no resolver.
- `userId` vem de `@GqlUser()`, **nunca** do input.
- `categoryId` revalidado contra `userId` antes do insert (proteção contra IDOR cross-user).

## Testing

- `src/app/transactions/create-transaction.spec.ts`
  - [ ] cria transação com input válido e categoria do próprio usuário.
  - [ ] `amount` é armazenado como inteiro em centavos.
  - [ ] `categoryId` de outro usuário lança `Categoria não encontrada` (mesma mensagem que id inexistente).
  - [ ] `categoryId` inexistente lança `Categoria não encontrada`.
- `src/graphql/resolvers/transaction.resolver.spec.ts` (integration)
  - [ ] mutation `createTransaction` com token válido cria e retorna o objeto.
  - [ ] sem token → erro de autenticação.
  - [ ] `type` aceita apenas `INCOME`/`EXPENSE` (erro de schema para outros valores).
- Atualizar `src/test/setup.ts` para `await prisma.transaction.deleteMany()` antes de `prisma.category.deleteMany()` (ordem importa pelo FK).

## Acceptance criteria

- [ ] Criar transação válida retorna o objeto com `id`, `category` (resolvido via FieldResolver futuro), `user`.
- [ ] Sem JWT → `Usuário não autenticado!`.
- [ ] `categoryId` alheio → `Categoria não encontrada`.
- [ ] `pnpm check` + `npx tsc --noEmit` + `pnpm test` verdes.

## Depends on

- [07 — Criar categoria](./07-criar-categoria.md) — FK target.
- [01 — Criar conta e login](./01-criar-conta-e-login.md).
- [02 — Escopo por usuário](./02-escopo-por-usuario.md).

## Out of scope

- Recorrência.
- Tags / anexos.
- Múltiplas categorias por transação.
- Conversão de moeda.
