# Tarefa 00 — Scaffolding

> Branch: `feat/00-scaffolding`. General workflow in [`README.md`](./README.md#workflow-per-tarefa).

## Goal

Boot Vite + dependencies + tooling + Apollo + codegen pointing at `backend/schema.graphql`. A blank page that renders "Financy" without errors. Every subsequent tarefa assumes this foundation is in place.

## Files to add or change

### Project configuration

- `package.json` — `"type": "module"`, scripts: `dev`, `build`, `preview`, `test`, `test:watch`, `lint`, `format`, `check`, `codegen`, `codegen:watch`.
- `pnpm-lock.yaml` — generated.
- `tsconfig.json` (references the others), `tsconfig.app.json` (strict, paths `@/*`), `tsconfig.node.json`.
- `vite.config.ts` — `@vitejs/plugin-react`, `@tailwindcss/vite`, alias `@` → `./src`.
- `vitest.config.ts` — `jsdom`, setupFiles `src/test/setup.ts`, globals `true`.
- `biome.json` — copy of the backend's (single quote, no semi, kebab-case, 2-space indent, 80 col).
- `codegen.ts` — `schema: '../backend/schema.graphql'`, `documents: ['src/**/*.graphql', 'src/**/*.tsx']`, typed-document-node presets, output `src/gql/`.
- `.env.example` — `VITE_BACKEND_URL=http://localhost:4000/graphql`
- `.gitignore` — `node_modules`, `dist`, `.env`, `.env.local`, `src/gql/` (generated; decision recorded here — generated on the fly, not committed).
- `index.html` — title "Financy", Inter Google Fonts `<link>`.
- `README.md` — basic commands, link to `docs/README.md`.

### Minimum dependencies

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
// added in later tarefas: sonner, react-hook-form, @radix-ui/react-dialog, ...

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

> Approximate versions — confirm with `pnpm add` at the time.

### Minimum source

- `src/main.tsx` — `createRoot`, mounts `<App />`.
- `src/App.tsx` — `<ApolloProvider>` + `<RouterProvider>` + `<Toaster>` (sonner comes later). For now: Apollo provider + "Financy" placeholder.
- `src/routes.tsx` — `createBrowserRouter` with a single `/` route → placeholder.
- `src/env.ts` — Zod schema validating `VITE_BACKEND_URL`. Exports `env`.
- `src/index.css` — Tailwind v4 base: `@import "tailwindcss";`. No tokens yet (tarefa 01 fills them in).
- `src/vite-env.d.ts`.
- `src/lib/apollo.ts` — `new ApolloClient({ link: HttpLink({ uri: env.VITE_BACKEND_URL }), cache: new InMemoryCache() })`. Empty auth link for now (hook placeholder for tarefa 02).
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge).
- `src/store/auth.ts` — Zustand store with the final shape but empty initial values: `{ token: null, user: null, isAuthenticated: false, setSession(){}, logout(){} }`. `persist` middleware with key `'financy-auth'`.

### Test infra

- `src/test/setup.ts` — `@testing-library/jest-dom` matchers, `beforeAll(server.listen)`, `afterEach(server.resetHandlers)`, `afterAll(server.close)`.
- `src/test/render.tsx` — `renderWithProviders` that wraps in `<MemoryRouter>` + `<ApolloProvider>` (or Apollo MockedProvider when useful).
- `src/test/msw/server.ts` — `setupServer(...handlers)`.
- `src/test/msw/handlers.ts` — empty array (each tarefa contributes handlers).
- `src/App.spec.tsx` — smoke test that renders `<App />` and checks that "Financy" appears.

## Authorization

N/A — no protected data in this tarefa.

## Testing

- [x] `src/App.spec.tsx` renders `<App />` without errors and checks the placeholder text.
- [x] `pnpm test` runs and passes.

## Acceptance criteria

- [x] `pnpm install` with no critical peer-dep warnings.
- [x] `pnpm dev` boots Vite on `http://localhost:5173` and renders "Financy" with no console errors.
- [x] `pnpm build` compiles without errors.
- [x] `pnpm codegen` reads `../backend/schema.graphql` and generates `src/gql/` without errors.
- [x] `pnpm test` green (at least the smoke test).
- [x] `pnpm check` (Biome) clean.
- [x] `pnpm tsc --noEmit` clean.
- [x] `.env.example` with `VITE_BACKEND_URL=http://localhost:4000/graphql`.
- [x] `.gitignore` excludes `node_modules`, `dist`, `.env`, `src/gql`.
- [x] `docs/README.md` (index) and `docs/00-scaffolding.md` (this file) with checkboxes filled in.

## Depends on

None — first tarefa.

## Out of scope

- Figma visual tokens (land in 01).
- shadcn components (land in 01).
- Real auth flow (lands in 02).
- Storybook.
- E2E.
