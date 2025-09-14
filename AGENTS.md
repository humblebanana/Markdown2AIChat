# Repository Guidelines

## Project Structure & Module Organization
- Next.js App Router project. Key folders: `app/` (routes, `layout.tsx`, `page.tsx`), `components/` (UI; e.g., `components/preview/MobilePreviewHTML.tsx`, `components/chat/*`, `components/product/*`), `lib/` (domain logic: `markdown/`, `product/`, `debug/`), `hooks/`, `types/`, and `public/`.
- `docs/` contains PRDs and design references (e.g., `docs/PRD.md`, `docs/svg.txt`); use for context only.
- Build artifacts live in `.next/` — never edit or commit generated files.

## Build, Test, and Development Commands
- From repo root:
  - `npm run dev` — start local dev server (http://localhost:3000, Turbopack).
  - `npm run build` — production build (Next.js + Turbopack).
  - `npm run start` — run the built app.
  - `npm run lint` — run ESLint; use `npm run lint -- --fix` to auto‑fix.

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Path alias `@/*` maps to the project root.
- Linting/format: `eslint` with `next/core-web-vitals` and `next/typescript`. Prefer 2‑space indentation; let ESLint handle quotes/style. Tailwind CSS v4 for styling.
- Naming:
  - React components: PascalCase files/exports (e.g., `MobilePreviewHTML.tsx`).
  - Hooks/utilities: kebab‑case files; hook names `useXxx` (e.g., `hooks/use-debounced-value.ts`).
  - Types/interfaces: PascalCase in `types/`.

## Testing Guidelines
- No test framework configured yet. Add colocated unit tests where helpful (e.g., `components/feature/__tests__/Feature.test.tsx`).
- Keep tests deterministic; prioritize core logic in `lib/markdown` and any rendering utilities.
- Consider Playwright for e2e tests under `e2e/` when adding flows.

## Commit & Pull Request Guidelines
- Use Conventional Commits (e.g., `feat: add mobile preview overlay`, `fix: correct markdown streaming`).
- PRs should include: clear description, linked issues, before/after screenshots for UI changes, reproduction steps, and validation notes (`npm run lint`, `npm run build`).

## Security & Configuration Tips
- Do not commit secrets; none required for local dev. Keep large binaries out of git; place static assets in `public/`.
- Avoid editing `.next/` or other generated files.

## Agent-Specific Instructions
- Prefer `rg` for fast search; keep changes minimal and TypeScript‑safe. Match existing structure/naming, follow ESLint, and avoid unrelated edits.
