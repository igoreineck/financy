# Tarefa 05 — Deve ser possível editar uma transação

> Origem: linha 62 da seção "Tarefas" em `requisitos.md`.
> Branch: `feat/05-editar-transacao`.

## Objetivo

Atualizar campos de uma transação existente do próprio usuário.

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

Todos opcionais — só os enviados são alterados.

## Files to add or change

- `src/graphql/inputs/transaction.input.ts` — adicionar `UpdateTransactionInput` (mesma forma do create, todos `@Field({ nullable: true })`).
- `src/app/transactions/update-transaction.ts` — `export async function updateTransaction(id, data, userId)`:
  1. `prisma.transaction.findFirst({ where: { id, userId } })` → se vazio, lança `Transação não encontrada`.
  2. Se `data.categoryId` foi enviado e difere da atual: `prisma.category.findFirst({ where: { id: data.categoryId, userId } })` → se vazio, lança `Categoria não encontrada`.
  3. `prisma.transaction.update({ where: { id }, data })`.
- `src/graphql/resolvers/transaction.resolver.ts` — adicionar mutation `updateTransaction(@Arg('id'), @Arg('data'), @GqlUser() user)`.

## Authorization

Ver [02 — Escopo por usuário](./02-escopo-por-usuario.md). Dois pontos:

1. A transação alvo pertence ao usuário.
2. A nova `categoryId` (se enviada) também pertence ao usuário — caso contrário, um atacante "moveria" a própria transação para categoria alheia.

## Testing

- `src/app/transactions/update-transaction.spec.ts`
  - [x] update parcial (só `description`) altera só o campo enviado.
  - [x] `amount: 0` é aceito (distinguir de "não enviado").
  - [x] update com `id` de outro usuário → `Transação não encontrada`.
  - [x] update com `categoryId` de outro usuário → `Categoria não encontrada`.
  - [x] `updatedAt` é atualizado.
- `src/graphql/resolvers/transaction.resolver.spec.ts`
  - [x] mutation retorna o objeto atualizado.
  - [x] usuário A não consegue editar transação de B.

## Acceptance criteria

- [x] Update parcial preserva campos não enviados.
- [x] `amount: 0` aceito.
- [x] Update cross-user → `Transação não encontrada`.
- [x] Mudança de `categoryId` para categoria alheia → `Categoria não encontrada`.
- [x] Suite verde.

## Depends on

- [03 — Criar transação](./03-criar-transacao.md).
- [01 — Criar conta e login](./01-criar-conta-e-login.md).
- [02 — Escopo por usuário](./02-escopo-por-usuario.md).

## Out of scope

- Histórico de versões.
- Edição em lote.
