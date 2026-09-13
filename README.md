# SallyForth storefront

Shopify Hydrogen storefront (React Router 7, TypeScript, plain CSS) for SallyForth — art, gardens, and stories for growing families. Deploys to Oxygen.

## Develop

```bash
npm install
npm run dev          # http://localhost:3100 (mock.shop until a store is linked)
npm test             # unit tests (Vitest)
npm run test:e2e     # Playwright (starts the dev server)
npm run typecheck && npm run lint
```

Link a real store: see `docs/store-setup.md`. Design spec: `docs/superpowers/specs/2026-09-13-hydrogen-storefront-design.md`. The original landing page is kept at `legacy/landing-page.html`; its art and fonts were extracted into `public/` by `scripts/extract-legacy-assets.mjs`.

## Layout of `app/`

- `config/shop.ts` — handles, nav, blog config, asset paths
- `components/` — layout (Frame, Header, MobileMenu, Footer), `home/` sections, skeleton cart/search components
- `lib/` — pure helpers (`marquee`, `parallax`), `newsletter/` (Admin API subscribe flow)
- `routes/` — React Router flat routes; `newsletter.tsx` is a POST-only resource route
- `styles/` — `tokens.css` (brand), `layout.css`, `home.css`, skeleton `app.css`/`reset.css`
