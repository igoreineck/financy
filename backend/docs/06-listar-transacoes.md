# Tarefa 06 — Deve ser possível listar todas as transações

> Origem: linha 63 da seção "Tarefas" em `requisitos.md`.
> Branch: `feat/06-listar-transacoes`.

## Objetivo

Listar todas as transações do próprio usuário, com a categoria associada.

## GraphQL surface

```graphql
type Query {
  listTransactions: [TransactionModel!]!
}
```

`TransactionModel` resolve `category: CategoryModel!` via `FieldResolver`.

## Files to add or change

- `src/app/transactions/list-transactions.ts` — `export async function listTransactions(userId)`:
  ```ts
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { occurredAt: 'desc' },
  })
  ```
- `src/app/transactions/find-transaction-category.ts` (ou reutilizar `list-categories` / um helper inline no resolver) — para o FieldResolver.
- `src/graphql/resolvers/transaction.resolver.ts` — adicionar:
  - `@Query(() => [TransactionModel]) listTransactions(@GqlUser() user)`.
  - `@FieldResolver(() => CategoryModel) category(@Root() tx: TransactionModel)` — busca por `tx.categoryId` (sem `userId` no `where` porque o `tx` já foi escopado pelo query pai).

## Authorization

Ver [02 — Escopo por usuário](./02-escopo-por-usuario.md). O `findMany` **deve** ter `where: { userId }`. O FieldResolver é seguro pois recebe apenas transações já escopadas.

## Testing

- `src/app/transactions/list-transactions.spec.ts`
  - [x] retorna só as transações do usuário autenticado (criar transações de A e B, listar como A, garantir que B não aparece).
  - [x] ordem `occurredAt` descendente.
  - [x] usuário sem transações recebe `[]`.
- `src/graphql/resolvers/transaction.resolver.spec.ts`
  - [x] query retorna lista populada com `category` resolvida.
  - [x] sem token → erro de autenticação.

## Acceptance criteria

- [x] `listTransactions` retorna só as transações do autenticado.
- [x] Ordem: `occurredAt` desc.
- [x] `category` resolvida com nome/cor/ícone.
- [x] Vazio → `[]`.
- [x] Sem JWT → `Usuário não autenticado!`.
- [x] Suite verde.

## Depends on

- [03 — Criar transação](./03-criar-transacao.md).
- [07 — Criar categoria](./07-criar-categoria.md) (para o FieldResolver).
- [01 — Criar conta e login](./01-criar-conta-e-login.md).
- [02 — Escopo por usuário](./02-escopo-por-usuario.md).

## Out of scope

- Paginação / cursor.
- Filtros (categoria, tipo, intervalo de datas).
- Busca textual.
- Agregações (totais, saldo).
