# Repository Guidelines

## Project Structure & Module Organization
- Root is a Next.js (App Router) project. Key folders: `app/` (routes, `layout.tsx`, `page.tsx`), `components/` (UI; e.g., `components/preview/MobilePreview.tsx`), `lib/` (domain logic: `markdown/`, `svg/`, `product/`, `debug/`), `hooks/`, `types/`, and `public/`.
- `docs/` holds PRDs and design assets.
- Build artifacts live in `.next/` — do not edit or commit generated files.

## Build, Test, and Development Commands
- From repo root:
  - `npm run dev` — start local dev server (http://localhost:3000, Turbopack).
  - `npm run build` — production build (Next.js + Turbopack).
  - `npm run start` — run the built app.
  - `npm run lint` — run ESLint checks; use `npm run lint -- --fix` to auto‑fix.

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Path alias `@/*` maps to the project root.
- Linting/format: `eslint` with `next/core-web-vitals` and `next/typescript`. Prefer 2‑space indentation; let ESLint handle quotes/style.
- Naming:
  - React components: PascalCase files/exports (e.g., `MobilePreview.tsx`).
  - Hooks/utilities: kebab-case files; hook names `useXxx` (e.g., `hooks/use-debounced-value.ts`).
  - Types/interfaces: PascalCase in `types/`.

## Testing Guidelines
- No test framework configured yet. Add colocated unit tests where helpful (e.g., `components/feature/__tests__/Feature.test.tsx`).
- Keep tests deterministic; prioritize core logic in `lib/markdown` and `lib/svg`.
- Consider Playwright for e2e tests under `e2e/`.

## Commit & Pull Request Guidelines
- Prefer Conventional Commits (e.g., `feat: add mobile preview overlay`, `fix: correct svg area mapping`).
- PRs: include a clear description, linked issues, before/after screenshots for UI changes, reproduction steps, and validation notes (`npm run lint`, build passing).

## Security & Configuration Tips
- Do not commit secrets; none are required for local dev. Keep large binaries out of git; store static assets in `public/`.
- Avoid editing `.next/` or other generated files.

## Agent-Specific Instructions
- Use `rg` for fast search; match existing structure/naming. Keep changes minimal, focused, and TypeScript‑safe. Follow ESLint and avoid unrelated edits.
