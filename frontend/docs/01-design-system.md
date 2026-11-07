# Tarefa 01 — Design system (style guide)

> Branch: `feat/01-design-system`. General workflow in [`README.md`](./README.md#workflow-per-tarefa).

## Goal

Translate the Figma Style Guide (`node-id=3-377`) into code: tokens in `@theme` + primitive components in `src/components/ui/`. Every subsequent visual tarefa reuses these primitives without inventing ad hoc variants.

## Files to add or change

### Tokens (Tailwind v4 `@theme`)

- `src/index.css` — fill in `@theme` by reading the hexes from the `🎨 Style Guide` page. Names follow Figma:

```css
@theme {
  --font-sans: "Inter", sans-serif;

  /* Brand */
  --color-brand-base: #...;     /* main green of the Solid button */
  --color-brand-light: #...;

  /* Grayscale (5+ shades) */
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

> Confirm each hex by inspecting Figma's `.ColorCard`s (click the swatch → Colors panel). Don't guess.

### Primitives (`src/components/ui/`)

One file per component, kebab-case, named export. Each uses `cn()` + CVA when there are variants.

| File                          | Variants                                  | States                          |
| ----------------------------- | ----------------------------------------- | ------------------------------- |
| `button.tsx`                  | `solid` \| `outline`, size `md` \| `sm`   | default, hover, disabled        |
| `icon-button.tsx`             | `outline` \| `danger`                     | default, hover, disabled        |
| `input.tsx`                   | (no variants — controlled via prop)       | empty, active, filled, error, disabled |
| `label.tsx`                   | —                                         | —                               |
| `link.tsx`                    | —                                         | default, hover                  |
| `dialog.tsx`                  | (Radix wrapper)                           | open / closed                   |
| `select.tsx`                  | (Radix wrapper)                           | empty, active, filled, error, disabled |
| `pagination-button.tsx`       | —                                         | default, hover, active, disabled |
| `tag.tsx`                     | `gray` \| `blue` \| `purple` \| `pink` \| `red` \| `orange` \| `yellow` \| `green` | — |
| `type-badge.tsx`              | `INCOME` (green, arrow-up) \| `EXPENSE` (red, arrow-down) | — |
| `sonner.tsx`                  | (Toaster wrapper with theme)              | —                               |

### Assets

- `src/components/common/logo.tsx` — inline SVG of the "FINANCY" logo (export from Figma).
- `src/components/common/logo-icon.tsx` — inline SVG of the logo icon.
- `index.html` — `<link rel="preconnect" href="https://fonts.googleapis.com">` + Inter (`300..700`).

### Utilities

- `src/lib/utils.ts` — `cn()` already exists from 00; add it if missing.

## Testing

No MSW in this tarefa (components don't touch the network).

- [x] `button.spec.tsx` — `solid` and `outline` × `md` and `sm` variants render; `disabled` blocks clicks; `asChild` via Radix `Slot` applies classes to the child.
- [x] `icon-button.spec.tsx` — `outline` and `danger` variants; the click handler is invoked; `disabled` blocks it.
- [x] `input.spec.tsx` — controlled value reflects the prop; `error` prop sets `aria-invalid`; `disabled` blocks typing; ref is forwarded (for future RHF).
- [x] `type-badge.spec.tsx` — `INCOME` applies the green class + arrow-up icon; `EXPENSE` applies the red class + arrow-down.
- [x] `tag.spec.tsx` — all 8 colors render with the matching class.
- [x] `dialog.spec.tsx` — opens via trigger; closes on ESC; closes on clicking the close button; `onOpenChange` is called.
- [x] `pagination-button.spec.tsx` — `active` state sets `aria-current="page"`; `disabled` disables it.
- [x] `select.spec.tsx` — opens the dropdown; selects an option; `onValueChange` receives the value.

## Acceptance criteria

- [x] All 11 primitives listed above exist in `src/components/ui/`.
- [x] Token hexes match the Figma swatches (Style Guide → Colors; brand `#1F6F43`/`#124B2B`, gray `#F8F9FA`→`#111827`, feedback `#19AD70`/`#EF4444`, 8 tag palettes with dark/base/light).
- [x] Inter loads via Google Fonts (no fallback-font flash in `pnpm dev`).
- [x] `pnpm test` green.
- [x] `pnpm check` clean.
- [x] `pnpm tsc --noEmit` clean.
- [x] `docs/01-design-system.md` (this file) with checkboxes filled in.

## Depends on

- [`00-scaffolding.md`](./00-scaffolding.md).

## Out of scope

- Storybook (RTL render tests cover the case).
- Internal `/style-guide` page to view primitives (optional, outside the MVP).
- Animations beyond Radix's defaults.
- Dark mode (the whole app is light).
