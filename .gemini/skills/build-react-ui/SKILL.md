---
name: build-react-ui
description: >-
  Build React UI from a mockup image and requirements.
disable-model-invocation: true
---

# Build React UI

Turn a UI mockup image and requirements into implemented React components. The input is always an image (screenshot, drawing, Figma export) plus a spoken or written description of what the view does and the user invokes this skill by name when both are ready.

## Before you start

Read the mockup and requirements. Identify:

1. **Every distinct visual region** in the mockup — header, sidebar, card, form, modal, list, empty state. Each is a candidate component.
2. **Every user action** described in the requirements — submit, navigate, filter, toggle. Each implies an event handler and possibly state.
3. **The feature name**: a short, lowercase kebab-case slug (e.g. `community-feed`, `profile-settings`). All files land under `client/src/features/{feature}/`.

Do not write code until this breakdown is complete. State it back to the user as a component tree with the planned file paths, then wait for confirmation before proceeding.

## Component tree

Map the visual regions to a tree. Rules:

- **One component per file.** Named export, PascalCase filename matching the export. No default exports.
- **Co-located CSS.** Each component `Foo.tsx` gets a sibling `Foo.css` imported at the top.
- **Feature folder layout:**

```
client/src/features/{feature}/
├── components/          # presentational components
│   ├── FooCard.tsx
│   ├── FooCard.css
│   ├── FooList.tsx
│   └── FooList.css
├── pages/               # route-level components
│   ├── FooPage.tsx
│   └── FooPage.css
└── hooks/               # feature-specific hooks
    └── useFoo.ts
```

- A **page** is the component a route renders. It composes feature components and handles data fetching. Pages go in `pages/`.
- A **component** is a reusable piece below the page level. Components go in `components/`.
- A **hook** extracts stateful logic shared between components in the same feature. Hooks go in `hooks/`.

### Completion criterion

The tree accounts for **every visual region and every user action** from the breakdown. No region is orphaned; no action is missing a home.

## Routing

This project uses React Router. When the feature introduces a new route:

1. Install `react-router` if not already present (`npm install react-router` in `client/`).
2. Register the route in `client/src/App.tsx` using `<Routes>` and `<Route>`.
3. Use `<Link>` for navigation; never raw `<a>` tags for internal links.

If the feature adds the **first route** to the project, set up the router provider in `client/src/main.tsx` wrapping `<App />` with `<BrowserRouter>`.

## Styling

Use **plain CSS** with the project's existing CSS custom properties. No utility frameworks, no CSS-in-JS.

### Design tokens (defined in `client/src/index.css`)

| Token | Purpose |
|---|---|
| `--text` | Body text color |
| `--text-h` | Heading / high-emphasis text |
| `--bg` | Page background |
| `--border` | Borders and dividers |
| `--accent` | Primary accent (purple) |
| `--accent-bg` | Accent background tint |
| `--accent-border` | Accent border |
| `--shadow` | Card / elevated surface shadow |
| `--sans`, `--heading`, `--mono` | Font stacks |

Rules:

- **Reference tokens by name**, never hardcode colors, font stacks, or shadows already captured by a token.
- Add new tokens to `:root` in `index.css` only when no existing token fits and the value repeats across components.
- Use **nested CSS selectors** (the project already uses them).
- Responsive: use `@media (max-width: 1024px)` as the single breakpoint, matching the existing convention.
- Dark mode is automatic through the existing `prefers-color-scheme` media query and token overrides. Only add dark-mode overrides if the component introduces a value not covered by tokens.

### Completion criterion

Every color, font, shadow, and border in the CSS references a token or is a genuinely new one-off value. No hex codes that duplicate a token.

## Implementation

Build each component bottom-up: leaves first, then composites, then the page.

For each component:

1. **Scaffold** the `.tsx` and `.css` files at the planned path.
2. **Props interface** — define and export a `Props` type. Use specific types, not `any`. Mark optional props with `?`.
3. **Markup** — translate the mockup region into semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`, `<button>`, `<form>`, `<label>`, `<input>`). No `<div>` soup.
4. **Style** — write the CSS using tokens. Class names are plain descriptive kebab-case (`.community-card`, `.profile-header`), scoped by the component's top-level class.
5. **Behaviour** — wire event handlers. State that belongs to this component stays local with `useState`. State shared across siblings lifts to the nearest common parent. Data fetched from the server goes through a custom hook in `hooks/`.

### API calls

When a component needs server data:

- Fetch from `/api/...` (Vite proxies to Express on port 3000).
- Wrap the fetch in a custom hook (`useFeatureName`) that returns `{ data, loading, error }`.
- Handle all three states in the UI: loading indicator, error message, and the data view.

### Accessibility

- Every `<img>` gets an `alt`.
- Every form input gets a visible `<label>` or `aria-label`.
- Interactive elements are `<button>` or `<a>`, never clickable `<div>` or `<span>`.
- Color contrast: text on accent backgrounds must meet WCAG AA (4.5:1 for normal text).

### Completion criterion

The page renders in the browser at its route, matches the mockup's layout and visual hierarchy, every user action from the requirements is wired (even if the backend endpoint is stubbed), and the component tree from the plan is fully implemented with no missing files.

## Verification

After all components are built:

1. Run `cd client && npx oxlint` — fix every error.
2. Run `npx tsc --noEmit` — fix every type error.
3. Start the dev server (`npm run dev` in `client/`) and visually confirm the page matches the mockup at both desktop and the 1024px breakpoint.

### Completion criterion

Lint and type-check pass with zero errors. The page renders without console errors and visually matches the mockup.
