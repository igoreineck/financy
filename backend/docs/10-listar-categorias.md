# Tarefa 10 — Deve ser possível listar todas as categorias

> Origem: linha 67 da seção "Tarefas" em `requisitos.md`.
> Branch: `feat/10-listar-categorias`.

## Objetivo

Listar todas as categorias do próprio usuário.

## GraphQL surface

```graphql
type Query {
  listCategories: [CategoryModel!]!
}
```

## Files to add or change

- `src/app/categories/list-categories.ts` — `export async function listCategories(userId)`:
  ```ts
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })
  ```
- `src/graphql/resolvers/category.resolver.ts` — adicionar `@Query(() => [CategoryModel]) listCategories(@GqlUser() user)`.

## Authorization

Ver [02 — Escopo por usuário](./02-escopo-por-usuario.md). `findMany` **deve** ter `where: { userId }`.

## Testing

- `src/app/categories/list-categories.spec.ts`
  - [x] retorna só as categorias do autenticado (criar categorias de A e B, listar como A, B não aparece).
  - [x] ordem `name` ascendente.
  - [x] usuário sem categorias recebe `[]`.
- `src/graphql/resolvers/category.resolver.spec.ts`
  - [x] query retorna lista.
  - [x] sem token → erro de autenticação.

## Acceptance criteria

- [x] `listCategories` retorna só as categorias do autenticado.
- [x] Ordem: `name` asc.
- [x] Vazio → `[]`.
- [x] Sem JWT → `Usuário não autenticado!`.
- [x] Suite verde.

## Depends on

- [07 — Criar categoria](./07-criar-categoria.md).
- [01 — Criar conta e login](./01-criar-conta-e-login.md).
- [02 — Escopo por usuário](./02-escopo-por-usuario.md).

## Out of scope

- Paginação.
- Filtros / busca.
- Contagem de transações por categoria (FieldResolver opcional, fora deste escopo).
