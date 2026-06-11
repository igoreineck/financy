# Tarefa 00 — Scaffolding

> Branch: `feat/00-scaffolding`. Workflow geral em [`README.md`](./README.md#workflow-per-tarefa).

## Objetivo

Boot do Vite + dependências + tooling + Apollo + codegen apontando pro `backend/schema.graphql`. Página em branco que renderiza "Financy" sem erros. Toda tarefa subsequente assume essa fundação pronta.

## Files to add or change

### Configuração de projeto

- `package.json` — `"type": "module"`, scripts: `dev`, `build`, `preview`, `test`, `test:watch`, `lint`, `format`, `check`, `codegen`, `codegen:watch`.
- `pnpm-lock.yaml` — gerado.
- `tsconfig.json` (referência os outros), `tsconfig.app.json` (strict, paths `@/*`), `tsconfig.node.json`.
- `vite.config.ts` — `@vitejs/plugin-react`, `@tailwindcss/vite`, alias `@` → `./src`.
- `vitest.config.ts` — `jsdom`, setupFiles `src/test/setup.ts`, globals `true`.
- `biome.json` — cópia da do backend (single quote, no semi, kebab-case, 2-space indent, 80 col).
- `codegen.ts` — `schema: '../backend/schema.graphql'`, `documents: ['src/**/*.graphql', 'src/**/*.tsx']`, presets typed-document-node, output `src/gql/`.
- `.env.example` — `VITE_BACKEND_URL=http://localhost:4000/graphql`
- `.gitignore` — `node_modules`, `dist`, `.env`, `.env.local`, `src/gql/` (gerado; decisão registrada aqui — gerado on-the-fly, sem commit).
- `index.html` — title "Financy", `<link>` Inter Google Fonts.
- `README.md` — comandos básicos, link pra `docs/README.md`.

### Dependências mínimas

```jsonc
// dependencies (production)
"@apollo/client": "^4",
"@tailwindcss/vite": "^4",
"@radix-ui/react-slot": "^1",
"clsx": "^2",
"graphql": "^16",
"lucide-react": "^0.553",
"react": "^19",
"react-dom": "^19",
"react-router": "^7",
"tailwind-merge": "^3",
"tailwindcss": "^4",
"zod": "^4",
"zustand": "^5",
// adicionado nas próximas tarefas: sonner, react-hook-form, @radix-ui/react-dialog, ...

// devDependencies
"@biomejs/biome": "^2",
"@graphql-codegen/cli": "^5",
"@graphql-codegen/client-preset": "^4",
"@parcel/watcher": "^2",
"@testing-library/jest-dom": "^6",
"@testing-library/react": "^16",
"@testing-library/user-event": "^14",
"@types/node": "^22",
"@types/react": "^19",
"@types/react-dom": "^19",
"@vitejs/plugin-react": "^5",
"jsdom": "^25",
"msw": "^2",
"typescript": "^5.7",
"vite": "^7",
"vitest": "^2"
```

> Versões aproximadas — confirmar com `pnpm add` na hora.

### Source mínimo

- `src/main.tsx` — `createRoot`, monta `<App />`.
- `src/App.tsx` — `<ApolloProvider>` + `<RouterProvider>` + `<Toaster>` (sonner virá depois). Por agora: provider Apollo + placeholder "Financy".
- `src/routes.tsx` — `createBrowserRouter` com rota única `/` → placeholder.
- `src/env.ts` — Zod schema validando `VITE_BACKEND_URL`. Exporta `env`.
- `src/index.css` — Tailwind v4 base: `@import "tailwindcss";`. Sem tokens ainda (tarefa 01 preenche).
- `src/vite-env.d.ts`.
- `src/lib/apollo.ts` — `new ApolloClient({ link: HttpLink({ uri: env.VITE_BACKEND_URL }), cache: new InMemoryCache() })`. Auth link vazio por enquanto (placeholder de hook na tarefa 02).
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge).
- `src/store/auth.ts` — Zustand store com shape final mas valores iniciais vazios: `{ token: null, user: null, isAuthenticated: false, setSession(){}, logout(){} }`. `persist` middleware com chave `'financy-auth'`.

### Test infra

- `src/test/setup.ts` — `@testing-library/jest-dom` matchers, `beforeAll(server.listen)`, `afterEach(server.resetHandlers)`, `afterAll(server.close)`.
- `src/test/render.tsx` — `renderWithProviders` que envolve em `<MemoryRouter>` + `<ApolloProvider>` (ou Apollo MockedProvider quando útil).
- `src/test/msw/server.ts` — `setupServer(...handlers)`.
- `src/test/msw/handlers.ts` — array vazio (cada tarefa contribui handlers).
- `src/App.spec.tsx` — smoke test que renderiza `<App />` e confere que "Financy" aparece.

## Authorization

N/A — sem dados protegidos nesta tarefa.

## Testing

- [x] `src/App.spec.tsx` renderiza `<App />` sem erros e confere texto placeholder.
- [x] `pnpm test` roda e passa.

## Acceptance criteria

- [x] `pnpm install` sem warnings críticos de peer dep.
- [x] `pnpm dev` boota Vite em `http://localhost:5173` e renderiza "Financy" sem erros no console.
- [x] `pnpm build` compila sem erros.
- [x] `pnpm codegen` lê `../backend/schema.graphql` e gera `src/gql/` sem erros.
- [x] `pnpm test` verde (pelo menos o smoke test).
- [x] `pnpm check` (Biome) limpo.
- [x] `pnpm tsc --noEmit` limpo.
- [x] `.env.example` com `VITE_BACKEND_URL=http://localhost:4000/graphql`.
- [x] `.gitignore` exclui `node_modules`, `dist`, `.env`, `src/gql`.
- [x] `docs/README.md` (índice) e `docs/00-scaffolding.md` (este arquivo) com checkboxes preenchidos.

## Depends on

Nenhuma — primeira tarefa.

## Out of scope

- Tokens visuais do Figma (entram na 01).
- Componentes shadcn (entram na 01).
- Auth flow real (entra na 02).
- Storybook.
- E2E.
