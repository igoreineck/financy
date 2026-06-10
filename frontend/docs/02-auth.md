# Tarefa 02 — Auth (criar conta + login)

> Origem: linha 73 da seção "Tarefas" em `requisitos.md`.
> Branch: `feat/02-auth`. Workflow geral em [`README.md`](./README.md#workflow-per-tarefa).

## Objetivo

Páginas `/login` e `/cadastro` + mutations Apollo (`login`, `register`) + `useAuthStore` populando + Apollo `setContext` injetando `Authorization: Bearer <token>` em cada request + route guards. Após login com sucesso, redireciona pra `/` (placeholder Dashboard).

## GraphQL surface (consumido — já existe no backend)

```graphql
mutation Login($data: LoginInput!) {
  login(data: $data) {
    token
    user { id name email }
  }
}

mutation Register($data: RegisterInput!) {
  register(data: $data) {
    token
    user { id name email }
  }
}
```

> Documentos vivem em `src/pages/auth/queries.graphql` e são lidos pelo codegen pra gerar `LoginDocument` + `useLoginMutation` em `src/gql/`.

## Files to add or change

### Páginas

- `src/pages/auth/login.tsx` — form com email + senha + checkbox "Lembrar-me" + link "Esqueceu?" (inert) + botão "Entrar" + link "Criar conta".
- `src/pages/auth/sign-up.tsx` — form com nome + email + senha + confirmar senha + botão "Cadastrar" + link "Já tem conta? Fazer login".
- `src/pages/auth/components/auth-card.tsx` — shell visual (container 448px centralizado + header com título e subtítulo + slot pra form + slot pra footer link).

### Estado e infra

- `src/store/auth.ts` — final:
  ```ts
  type AuthState = {
    token: string | null
    user: { id: string; name: string; email: string } | null
    isAuthenticated: boolean
    setSession: (data: { token: string; user: ... }) => void
    logout: () => void
  }
  ```
  `persist` com chave `'financy-auth'` em `localStorage`. Se "Lembrar-me" estiver desmarcado, usar `sessionStorage` via `createJSONStorage(() => sessionStorage)` dinamicamente — confirmar UX no PR.

- `src/lib/apollo.ts` — final:
  ```ts
  const authLink = setContext((_, { headers }) => {
    const token = useAuthStore.getState().token
    return { headers: { ...headers, authorization: token ? `Bearer ${token}` : '' } }
  })
  export const apolloClient = new ApolloClient({
    link: from([authLink, new HttpLink({ uri: env.VITE_API_URL })]),
    cache: new InMemoryCache(),
  })
  ```

### Guards e layout

- `src/components/guards/protected-route.tsx` — `useAuthStore(s => s.isAuthenticated)`; sem auth → `<Navigate to="/login" replace />`.
- `src/components/guards/public-route.tsx` — com auth → `<Navigate to="/" replace />`.
- `src/components/layout/public-layout.tsx` — header só com `<LogoIcon />` centralizado, `<Outlet />` no centro.
- `src/routes.tsx` — atualizado:
  ```tsx
  createBrowserRouter([
    { element: <PublicLayout />, children: [
      { path: '/login', element: <PublicRoute><Login /></PublicRoute> },
      { path: '/cadastro', element: <PublicRoute><SignUp /></PublicRoute> },
    ]},
    { element: <ProtectedRoute><AppLayout /></ProtectedRoute>, children: [
      { path: '/', element: <DashboardPlaceholder /> },
    ]},
  ])
  ```

### Forms

- React Hook Form + Zod. Schemas inline na page (brev.ly style):

```ts
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})
type LoginForm = z.infer<typeof loginSchema>
```

Parse no `onSubmit` (`schema.parse(data)`) — sem resolver Zod no `useForm`.

### Validação client (cadastro)

- `name` obrigatório.
- `email` formato válido.
- `password` mínimo 6 caracteres.
- `confirmPassword` igual a `password` (validação cruzada via `refine`).

Mensagens de erro em pt-BR.

## Testing

- [x] `pages/auth/login.spec.tsx`
  - Render mostra campos e botão.
  - Submit com email/senha válidos (MSW) chama mutation, store popula, `useNavigate` redireciona pra `/` (renderiza placeholder do dashboard).
  - Mutation rejeitada com `Senha inválida!` (MSW) exibe toast `sonner` com a mensagem.
  - Validação client bloqueia submit com campos inválidos.
- [x] `pages/auth/sign-up.spec.tsx`
  - Validação client: senha < 6 bloqueia; confirmação ≠ senha bloqueia.
  - Submit válido chama `register` (MSW), store popula, redireciona pro placeholder do dashboard.
  - Backend rejeita `E-mail já cadastrado!` → toast.
- [x] `store/auth.spec.ts`
  - `setSession` popula `token`, `user`, `isAuthenticated=true`.
  - `logout` limpa tudo.
  - Persiste sob `financy-auth` em `localStorage`.
- [x] `components/guards/protected-route.spec.tsx`
  - Sem token → redireciona pra `/login` via `<Navigate>`.
  - Com token → render `children`.
- [x] `components/guards/public-route.spec.tsx` — espelho do anterior (redireciona pra `/` quando autenticado).
- [ ] `auth.integration.spec.tsx` — coberto inline pelos specs de `login.spec.tsx` e `sign-up.spec.tsx` (cada um faz o fluxo `/login` ou `/cadastro` → submit MSW → dashboard placeholder + store populada). Spec separada removida pra evitar duplicação.

## Acceptance criteria

- [x] Login com credenciais válidas redireciona pra `/`.
- [x] Cadastro com sucesso já autentica e redireciona pra `/`.
- [x] Erros do backend (mensagens pt-BR) aparecem em toast Sonner.
- [x] "Esqueceu?" visível mas inert (`aria-disabled`, `title="Em breve"`, sem handler).
- [x] "Lembrar-me": default = checkbox marcado → sessão persiste em `localStorage`. Desmarcado → sessão em `sessionStorage` (some ao fechar a aba/navegador). Implementado via storage adapter dual no `useAuthStore` que lê uma flag versionada (`financy-remember-v1`) pra decidir o destino a cada read/write.
- [x] Refresh da página com token válido mantém sessão (Zustand `persist` em `localStorage` + Apollo authLink lê o token a cada request).
- [x] Linha em `requisitos.md` marcada.
- [x] `pnpm test` verde; `pnpm check` limpo; `pnpm tsc --noEmit` limpo.
- [x] `docs/02-auth.md` (este arquivo) com checkboxes preenchidos.

## Depends on

- [`00-scaffolding.md`](./00-scaffolding.md) — Apollo + Zustand + routing infra.
- [`01-design-system.md`](./01-design-system.md) — `<Button>`, `<Input>`, `<Label>`, `<Link>`, `<Toaster>`, `<LogoIcon>`.
- Backend `01 — Criar conta e login` já mergeado (confirmado: `f36d32a`).

## Out of scope

- Refresh token rotation (backend não suporta).
- Recuperação de senha.
- Verificação de email.
- OAuth / login social.
- Rate limiting client-side.
