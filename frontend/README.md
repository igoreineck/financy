# Financy — Frontend

App React + Vite que consome a API GraphQL do `../backend`.

## Comandos

```bash
pnpm install
cp .env.example .env       # configure VITE_API_URL se necessário
pnpm codegen               # gera src/gql/ a partir de ../backend/schema.graphql
pnpm dev                   # http://localhost:5173
pnpm build
pnpm test
pnpm check                 # Biome lint + format
```

## Documentação

Plano de execução completo em [`docs/README.md`](./docs/README.md). Cada tarefa
tem seu próprio `docs/NN-*.md` com escopo, critérios de aceite e checklist.

Requisitos funcionais em [`requisitos.md`](./requisitos.md).
