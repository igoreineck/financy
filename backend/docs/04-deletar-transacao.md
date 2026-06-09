# Tarefa 04 — Deve ser possível deletar uma transação

> Origem: linha 61 da seção "Tarefas" em `requisitos.md`.
> Branch: `feat/04-deletar-transacao`.

## Objetivo

Excluir uma transação do próprio usuário pelo id.

## GraphQL surface

```graphql
type Mutation {
  deleteTransaction(id: ID!): Boolean!
}
```

Retorna `true` em sucesso; erro caso a transação não exista ou pertença a outro usuário.

## Files to add or change

- `src/app/transactions/delete-transaction.ts` — `export async function deleteTransaction(id, userId)`:
  ```ts
  const existing = await prisma.transaction.findFirst({ where: { id, userId } })
  if (!existing) throw new Error('Transação não encontrada')
  await prisma.transaction.delete({ where: { id } })
  ```
  > Use `findFirst({ where: { id, userId } })` (não `findUnique` + check em memória) para garantir o filtro como parte da query.
- `src/graphql/resolvers/transaction.resolver.ts` — adicionar mutation `deleteTransaction(@Arg('id'), @GqlUser() user)` que delega e retorna `true`.

## Authorization

Ver [02 — Escopo por usuário](./02-escopo-por-usuario.md). Caso crítico para IDOR.

## Testing

- `src/app/transactions/delete-transaction.spec.ts`
  - [x] delete do próprio: a transação some no `prisma.transaction.findMany`.
  - [x] id inexistente → `Transação não encontrada`.
  - [x] id de outro usuário → `Transação não encontrada` (mesma mensagem).
- `src/graphql/resolvers/transaction.resolver.spec.ts`
  - [x] mutation retorna `true` em sucesso.
  - [x] usuário A não consegue deletar transação de B.

## Acceptance criteria

- [x] Delete válido retorna `true` e some no `listTransactions`.
- [x] Id inexistente → `Transação não encontrada`.
- [x] Id de outro usuário → `Transação não encontrada` (não vazar existência).
- [x] Sem JWT → `Usuário não autenticado!`.
- [x] Suite verde.

## Depends on

- [03 — Criar transação](./03-criar-transacao.md).
- [01 — Criar conta e login](./01-criar-conta-e-login.md).
- [02 — Escopo por usuário](./02-escopo-por-usuario.md).

## Out of scope

- Soft delete / lixeira.
- Bulk delete.
- Undo.
