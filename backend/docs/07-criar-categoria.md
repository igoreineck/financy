# Tarefa 07 — It must be possible to create a category

> Origin: line 64 of the "Tarefas" section in `requisitos.md`.
> Branch: `feat/07-criar-categoria`.

## Goal

Let the authenticated user create a category to classify their transactions.

## GraphQL surface

```graphql
input CreateCategoryInput {
  name: String!
  color: String!         # hex, e.g. '#FF5733'
  icon: String!          # identifier (e.g. a Lucide icon name)
  description: String
}

type Mutation {
  createCategory(data: CreateCategoryInput!): CategoryModel!
}
```

## Files to add or change

### Prisma
- `prisma/schema.prisma` — add:
  ```prisma
  model Category {
    id          String   @id @default(uuid())
    name        String
    color       String
    icon        String
    description String?
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt

    userId       String
    user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)

    transactions Transaction[]
  }
  ```
- Run `pnpm migrate --name add-category`. (Comes **before** the Transaction migration in tarefa 03 — the category must exist before any FK points at it.)

### GraphQL surface
- `src/graphql/models/category.model.ts` — `@ObjectType CategoryModel`.
- `src/graphql/inputs/category.input.ts` — `CreateCategoryInput`.
- `src/graphql/resolvers/category.resolver.ts` — `@Resolver(() => CategoryModel) @UseMiddleware(IsAuth)`. Mutation `createCategory(@Arg('data'), @GqlUser() user)`.

### Business logic
- `src/app/categories/create-category.ts` — `export async function createCategory(input, userId)`:
  ```ts
  return prisma.category.create({ data: { ...input, userId } })
  ```

### Wiring
- `src/infra/http/server.ts` — register `CategoryResolver`.

## Authorization

See [02 — Per-user scoping](./02-escopo-por-usuario.md). `userId` comes from `@GqlUser()`, **never** from the input.

## Testing

- `src/app/categories/create-category.spec.ts`
  - [x] creates the category and returns the object with the correct `userId`.
  - [x] optional `description` becomes `null` when absent.
- `src/graphql/resolvers/category.resolver.spec.ts`
  - [x] `createCategory` mutation with a token creates it.
  - [x] no token → authentication error.
- Update `src/test/setup.ts` to `await prisma.category.deleteMany()` before `prisma.user.deleteMany()`.

## Acceptance criteria

- [x] Creating a valid category returns the object.
- [x] `color` stored as a string (no hex validation — the frontend validates).
- [x] `description` optional.
- [x] No JWT → `User not authenticated!`.
- [x] Suite green.

## Depends on

- [01 — Create account and log in](./01-criar-conta-e-login.md).
- [02 — Per-user scoping](./02-escopo-por-usuario.md).

## Out of scope

- Color validation (hex regex).
- Unique-name-per-user validation.
- Pre-registered default categories (seed).
- Shared / global categories.
