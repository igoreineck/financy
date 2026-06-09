# financy — backend

GraphQL API for a personal-finance app: email/password auth plus user-scoped CRUD over categories and transactions. Built for the Rocketseat Pós-Tech assignment.

## Stack

- **Runtime**: Node.js + TypeScript (ESM, `strict` on).
- **HTTP**: Express 5 + CORS.
- **GraphQL**: Apollo Server 5 mounted on Express via `@as-integrations/express5`.
- **Schema**: [TypeGraphQL](https://typegraphql.com) — schema is generated from decorated classes; no `.graphql` SDL file to keep in sync.
- **ORM**: Prisma 6 against SQLite (`file:./dev.db`). Singleton client cached on `globalThis` so `tsx watch` reloads don't open new connections.
- **Auth**: `bcryptjs` for password hashing, `jsonwebtoken` (HS256, 1-day TTL) signed with `JWT_SECRET`. Context reads `Authorization: Bearer <token>` and exposes the user id; `IsAuth` middleware guards protected resolvers.
- **Env**: Zod-parsed at module load (`src/env.ts`) — missing vars crash at boot, not first use.
- **Lint/format**: Biome (single source of truth — `biome.json`).
- **Tests**: Vitest, single-fork pool sharing one SQLite connection. Setup at `src/test/setup.ts` migrates `file:./test.db` and wipes rows between tests.

## Requirements

- Node 20+
- pnpm 9+

## Setup

```bash
pnpm install
cp .env.example .env          # then set JWT_SECRET
pnpm migrate                  # apply schema to ./dev.db
pnpm dev                      # http://localhost:4000/graphql
```

Apollo Sandbox is served at the same URL — paste the operations below into it. After `login`/`register`, set the HTTP header `Authorization: Bearer <token>` to call the protected resolvers.

### Environment variables

| Var | Required | Default | Notes |
|---|---|---|---|
| `NODE_ENV` | no | `development` | |
| `PORT` | no | `4000` | HTTP port |
| `DATABASE_URL` | yes | `file:./dev.db` | Prisma datasource. SQLite by default; Postgres works if you swap the provider in `schema.prisma` |
| `JWT_SECRET` | yes | — | HS256 signing key |
| `CORS_ORIGIN` | no | `http://localhost:5173` | Allowed Origin header |

`.env.test` (committed) drives the test DB at `file:./test.db`.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start Apollo + Express in watch mode |
| `pnpm test` | Run the Vitest suite once against the test DB |
| `pnpm test:watch` | Same, watch mode |
| `pnpm test:reset` | Drop and re-migrate the test DB |
| `pnpm lint` | Biome lint (no fixes) |
| `pnpm format` | Biome format with autofix |
| `pnpm check` | Biome lint **and** format with autofix — run before every commit |
| `pnpm migrate` | `prisma migrate dev` (pass `--name <slug>` for new migrations) |
| `pnpm generate` | Regenerate the Prisma client without migrating |
| `pnpm export-schema` | Build the GraphQL schema and write `./schema.graphql` for the frontend |

## Project layout

```
backend/
├── prisma/
│   ├── schema.prisma             # User / Category / Transaction
│   └── migrations/
├── src/
│   ├── env.ts                    # Zod-validated env
│   ├── infra/
│   │   ├── http/server.ts        # Apollo + Express bootstrap
│   │   └── db/prisma.ts          # PrismaClient singleton
│   ├── graphql/                  # TypeGraphQL surface (classes)
│   │   ├── context.ts            # JWT → { user }
│   │   ├── decorators/           # @GqlUser()
│   │   ├── middlewares/          # IsAuth
│   │   ├── models/               # @ObjectType
│   │   ├── inputs/               # @InputType
│   │   ├── outputs/              # AuthOutput
│   │   └── resolvers/            # @Resolver classes (+ *.spec.ts)
│   ├── app/                      # business logic (functions, not classes)
│   │   ├── auth/
│   │   ├── categories/
│   │   └── transactions/
│   ├── shared/                   # hash.ts, jwt.ts
│   └── test/setup.ts             # vitest hooks
└── docs/                         # one spec per tarefa (01..10)
```

`src/graphql` holds anything TypeGraphQL forces to be a class. Domain logic in `src/app` is plain functions — easier to test and call directly. Resolvers stay thin: parse args, call the function, return the row.

## GraphQL API

### Scalar / enum types

- `DateTimeISO` — ISO-8601 string (TypeGraphQL's built-in scalar for `Date`).
- `TransactionType` — `INCOME | EXPENSE`.
- `amount` is **integer cents** (`100` = R$ 1,00). Never a float; SQLite floats round badly.

### Object types

```graphql
type UserModel {
  id: ID!
  name: String!
  email: String!
  createdAt: DateTimeISO!
  updatedAt: DateTimeISO!
}

type AuthOutput {
  token: String!
  user: UserModel!
}

type CategoryModel {
  id: ID!
  name: String!
  color: String!
  icon: String!
  description: String       # nullable
  createdAt: DateTimeISO!
  updatedAt: DateTimeISO!
}

type TransactionModel {
  id: ID!
  description: String!
  amount: Int!              # cents
  type: TransactionType!
  occurredAt: DateTimeISO!
  categoryId: ID!
  category: CategoryModel!  # eagerly loaded via Prisma include
  createdAt: DateTimeISO!
  updatedAt: DateTimeISO!
}
```

### Input types

```graphql
input RegisterInput { name: String!, email: String!, password: String! }
input LoginInput    { email: String!, password: String! }

input CreateCategoryInput {
  name: String!
  color: String!
  icon: String!
  description: String
}
input UpdateCategoryInput {       # all nullable — only sent fields change
  name: String
  color: String
  icon: String
  description: String             # passing null clears the field
}

input CreateTransactionInput {
  description: String!
  amount: Int!
  type: TransactionType!
  occurredAt: DateTimeISO!
  categoryId: ID!
}
input UpdateTransactionInput {    # all nullable
  description: String
  amount: Int
  type: TransactionType
  occurredAt: DateTimeISO
  categoryId: ID
}
```

### Queries

| Operation | Auth | Returns | Notes |
|---|---|---|---|
| `me` | required | `UserModel!` | The authenticated user row |
| `listCategories` | required | `[CategoryModel!]!` | Only the caller's categories |
| `category(id: ID!)` | required | `CategoryModel!` | Cross-user or missing id → `Categoria não encontrada` |
| `listTransactions` | required | `[TransactionModel!]!` | Only the caller's transactions, ordered by `occurredAt DESC` |
| `transaction(id: ID!)` | required | `TransactionModel!` | Cross-user or missing id → `Transação não encontrada` |

### Mutations

| Operation | Auth | Returns | Notes |
|---|---|---|---|
| `register(data: RegisterInput!)` | public | `AuthOutput!` | Hashes password, normalizes email (trim + lowercase), issues 1-day JWT |
| `login(data: LoginInput!)` | public | `AuthOutput!` | Normalizes email casing; both unknown email and bad password throw `Credenciais inválidas!` |
| `createCategory(data: CreateCategoryInput!)` | required | `CategoryModel!` | |
| `updateCategory(id: ID!, data: UpdateCategoryInput!)` | required | `CategoryModel!` | Partial; `description: null` clears the field; passing `null` on `name`/`color`/`icon` throws `Nome, cor e ícone não podem ser nulos` |
| `deleteCategory(id: ID!)` | required | `Boolean!` | Blocks with `Categoria possui transações associadas e não pode ser excluída` if linked transactions exist (FK is `onDelete: Restrict`) |
| `createTransaction(data: CreateTransactionInput!)` | required | `TransactionModel!` | Rejects with `Categoria não encontrada` if `categoryId` belongs to another user |
| `updateTransaction(id: ID!, data: UpdateTransactionInput!)` | required | `TransactionModel!` | Partial; cross-user `categoryId` → `Categoria não encontrada`; explicit `null` on any field → `Campos obrigatórios não podem ser nulos` |
| `deleteTransaction(id: ID!)` | required | `Boolean!` | |

### Example operations

Register and capture the token:

```graphql
mutation {
  register(data: { name: "Igor", email: "igor@example.com", password: "s3cret123" }) {
    token
    user { id name email }
  }
}
```

Then with header `Authorization: Bearer <token>`:

```graphql
mutation {
  createCategory(data: { name: "Alimentação", color: "#FF5733", icon: "utensils" }) {
    id name color icon
  }
}

mutation {
  createTransaction(data: {
    description: "Almoço"
    amount: 1234              # R$ 12,34
    type: EXPENSE
    occurredAt: "2026-06-08T12:00:00.000Z"
    categoryId: "<category id>"
  }) {
    id description amount type occurredAt
    category { id name }
  }
}

query {
  listTransactions {
    id description amount type occurredAt
    category { id name color icon }
  }
}
```

Smoke check the server is up:

```bash
curl -s -X POST http://localhost:4000/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"{ __typename }"}'
```

## Authorization model

Every resolver that reads or writes `Category` or `Transaction` is decorated with `@UseMiddleware(IsAuth)` and every Prisma call is scoped to the caller's `userId`. Cross-user access returns the same "não encontrado" message used for genuinely missing rows — the API never confirms whether another user's resource exists. See `docs/02-escopo-por-usuario.md` for the full invariant and the IDOR cases the tests cover.

The JWT context distinguishes three states: no token (or a token whose user no longer exists) → `Usuário não autenticado!`; expired token → `Sessão expirada!`; malformed/forged token → `Token inválido!`. The FE can branch on these to decide whether to refresh, redirect to login, or surface a generic auth failure.

User-facing error messages are in Portuguese (the assignment is a Brazilian course); everything else — code, tests, comments, commits — is English.

## Testing

`pnpm test` runs three layers of coverage:

1. **Unit** — colocated `*.spec.ts` next to each function in `src/app/`, hitting the real Prisma client against `file:./test.db`.
2. **Resolver integration** — `*.resolver.spec.ts` builds the schema and runs operations through `ApolloServer.executeOperation`, asserting on the GraphQL response (including auth errors).
3. **Ownership smoke** — every CRUD has at least one cross-user test that registers two users and confirms B cannot read/update/delete A's resources.

Test data uses `@faker-js/faker`. Users are always created via the real `registerUser` function so password hashing stays honest.

## Database

Prisma models (see `prisma/schema.prisma`):

- `User` — owner of everything.
- `Category` — `name`, `color`, `icon`, optional `description`. `onDelete: Cascade` from `User`.
- `Transaction` — `description`, `amount` (Int cents), `type` (String, mapped to `TransactionType` via TypeGraphQL `registerEnumType`), `occurredAt`. `onDelete: Cascade` from `User`, `onDelete: Restrict` from `Category` so deleting a category with transactions fails loudly.

SQLite has no native enum — Prisma stores `TransactionType` as `String` and TypeGraphQL enforces the union at the API layer.
