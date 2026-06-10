# Tarefa 01 — Design system (style guide)

> Branch: `feat/01-design-system`. Workflow geral em [`README.md`](./README.md#workflow-per-tarefa).

## Objetivo

Traduzir o Style Guide do Figma (`node-id=3-377`) pro código: tokens em `@theme` + componentes primitivos em `src/components/ui/`. Toda tarefa visual subsequente reaproveita esses primitivos sem inventar variantes ad hoc.

## Files to add or change

### Tokens (Tailwind v4 `@theme`)

- `src/index.css` — preencher `@theme` lendo os hexes da página `🎨 Style Guide`. Nomes seguem o Figma:

```css
@theme {
  --font-sans: "Inter", sans-serif;

  /* Brand */
  --color-brand-base: #...;     /* verde principal do botão Solid */
  --color-brand-light: #...;

  /* Grayscale (5 tons +) */
  --color-gray-50: #...;
  --color-gray-100: #...;
  --color-gray-200: #...;
  --color-gray-300: #...;
  --color-gray-400: #...;
  --color-gray-500: #...;
  --color-gray-600: #...;
  --color-gray-700: #...;

  /* Feedback */
  --color-feedback-positive: #...;
  --color-feedback-negative: #...;
  --color-neutral-info: #...;

  /* Tag categories (8) */
  --color-tag-gray: #...;
  --color-tag-blue: #...;
  --color-tag-purple: #...;
  --color-tag-pink: #...;
  --color-tag-red: #...;
  --color-tag-orange: #...;
  --color-tag-yellow: #...;
  --color-tag-green: #...;

  --radius: 0.5rem;
}
```

> Confirmar cada hex inspecionando as `.ColorCard` do Figma (clicar no swatch → painel Colors). Não chutar.

### Primitivos (`src/components/ui/`)

Um arquivo por componente, kebab-case, named export. Cada um usa `cn()` + CVA quando há variants.

| Arquivo                       | Variants                                  | States                          |
| ----------------------------- | ----------------------------------------- | ------------------------------- |
| `button.tsx`                  | `solid` \| `outline`, size `md` \| `sm`   | default, hover, disabled        |
| `icon-button.tsx`             | `outline` \| `danger`                     | default, hover, disabled        |
| `input.tsx`                   | (sem variants — controla via prop)        | empty, active, filled, error, disabled |
| `label.tsx`                   | —                                         | —                               |
| `link.tsx`                    | —                                         | default, hover                  |
| `dialog.tsx`                  | (Radix wrapper)                           | open / closed                   |
| `select.tsx`                  | (Radix wrapper)                           | empty, active, filled, error, disabled |
| `pagination-button.tsx`       | —                                         | default, hover, active, disabled |
| `tag.tsx`                     | `gray` \| `blue` \| `purple` \| `pink` \| `red` \| `orange` \| `yellow` \| `green` | — |
| `type-badge.tsx`              | `INCOME` (verde, arrow-up) \| `EXPENSE` (vermelho, arrow-down) | — |
| `sonner.tsx`                  | (Toaster wrapper com theme)               | —                               |

### Assets

- `src/components/common/logo.tsx` — SVG inline do logo "FINANCY" (exportar do Figma).
- `src/components/common/logo-icon.tsx` — SVG inline do logo icon.
- `index.html` — `<link rel="preconnect" href="https://fonts.googleapis.com">` + Inter (`300..700`).

### Utilitários

- `src/lib/utils.ts` — `cn()` já existe da 00; adicionar se faltar.

## Testing

Sem MSW nesta tarefa (componentes não tocam rede).

- [x] `button.spec.tsx` — variants `solid` e `outline` × `md` e `sm` renderizam; `disabled` bloqueia click; `asChild` via Radix `Slot` aplica classes ao filho.
- [x] `icon-button.spec.tsx` — variants `outline` e `danger`; click handler é invocado; `disabled` bloqueia.
- [x] `input.spec.tsx` — controlled value reflete prop; `error` prop seta `aria-invalid`; `disabled` bloqueia digitação; ref encaminhado (pra RHF futuro).
- [x] `type-badge.spec.tsx` — `INCOME` aplica classe verde + ícone arrow-up; `EXPENSE` aplica classe vermelha + arrow-down.
- [x] `tag.spec.tsx` — todas as 8 cores renderizam com a classe correspondente.
- [x] `dialog.spec.tsx` — abre via trigger; fecha em ESC; fecha em click no botão de fechar; `onOpenChange` é chamado.
- [x] `pagination-button.spec.tsx` — state `active` marca `aria-current="page"`; `disabled` desativa.
- [x] `select.spec.tsx` — abre dropdown; seleciona opção; `onValueChange` recebe valor.

## Acceptance criteria

- [x] Todos os 11 primitivos listados acima existem em `src/components/ui/`.
- [x] Hexes dos tokens batem com os swatches do Figma (Style Guide → Cores; brand `#1F6F43`/`#124B2B`, gray `#F8F9FA`→`#111827`, feedback `#19AD70`/`#EF4444`, 8 paletas de tag com dark/base/light).
- [x] Inter carrega via Google Fonts (sem flash de fonte fallback no `pnpm dev`).
- [x] `pnpm test` verde.
- [x] `pnpm check` limpo.
- [x] `pnpm tsc --noEmit` limpo.
- [x] `docs/01-design-system.md` (este arquivo) com checkboxes preenchidos.

## Depends on

- [`00-scaffolding.md`](./00-scaffolding.md).

## Out of scope

- Storybook (testes de render via RTL cobrem o caso).
- Página interna `/style-guide` pra visualizar primitivos (opcional, fora do MVP).
- Animações além das defaults do Radix.
- Dark mode (todo o app é light).
