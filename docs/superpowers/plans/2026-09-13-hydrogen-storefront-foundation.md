# Hydrogen Storefront — Plan 1: Foundation + Home Page

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static landing page with a Hydrogen storefront whose home page is a faithful port of the landing page, with working cart, newsletter signup, and shared layout — the base that Plans 2 (shop + content pages + search) and 3 (SEO + deployment) build on.

**Architecture:** Official Hydrogen skeleton (React Router 7 framework mode, TypeScript, plain CSS) scaffolded at the repo root. The skeleton's collection/product/cart/search routes are kept as-is for now; the layout (frame, header, mobile menu, footer), the home route, and a newsletter resource route are ours. Storefront API for reads; Admin API only inside the newsletter action. Assets are extracted once from the old bundle into `public/`.

**Tech Stack:** `@shopify/hydrogen` 2026.4.x, `react-router` 7.16, React 18, Vite 8, TypeScript 5.9, Node 22, Vitest (unit), Playwright (e2e), Shopify CLI (via `npx shopify`).

**Spec:** `docs/superpowers/specs/2026-09-13-hydrogen-storefront-design.md` — read it first; this plan implements §3–§8, §11, §14–§17 of it.

## Global Constraints

- Node `^22 || ^24` (the skeleton's `engines`); `npm` as the package manager.
- Plain CSS only — no Tailwind, no CSS-in-JS. Brand tokens live in `app/styles/tokens.css` and are the only place colors/fonts are defined.
- Fonts: `'Abril Fatface'` (display) and `'Libre Caslon Text'` (body), self-hosted from `public/fonts/`. **Palmore is dropped** — it must not appear in any font stack.
- Long-form Shopify rich text renders at **17px / 1.75**; landing-page UI sizes (nav 14px, eyebrows 11–13px, teaser body 15px) are kept as designed.
- Handles: featured collection `frontpage`, blogs `blog` and `bits-and-bobs-almanac`, page `about` — defined once in `app/config/shop.ts`.
- URLs: `/collections/all` (Shop), `/about`, `/blog`, `/bits-and-bobs-almanac`. Never link to `/blogs/...` or `/pages/about`.
- Behavioral fixes that must hold (spec §7): footer is one column at ≤600px; hero parallax progress derives from hero height; marquee is seamless at any viewport; carousel `scroll-padding-left` equals section padding (64px, 24px at ≤900px). `prefers-reduced-motion` disables parallax and marquee motion.
- No customer accounts: `app/routes/account*.tsx` are deleted and nothing links to `/account`.
- Secrets: `PRIVATE_ADMIN_API_ACCESS_TOKEN` only in `.env` (gitignored) / Oxygen secrets; never imported into client code.
- Commit after every task with the message given in the task. Do not push.
- Work on a new branch `hydrogen-storefront` created from the current branch (`replace-landing-page-content`), which already contains the landing-page swap and the spec.

---

## File map (what Plan 1 creates or changes)

| Path | Responsibility |
|---|---|
| `legacy/landing-page.html` | the old bundled landing page, moved here for reference only |
| `scripts/extract-legacy-assets.mjs` | one-time extraction of the 25 bundled assets into `public/` |
| `public/art/*.webp`, `public/art/*.svg`, `public/fonts/*.woff2` | extracted static assets |
| `app/config/shop.ts` | shop name, handles, nav links, blog config, asset path map |
| `app/styles/tokens.css` | @font-face, CSS variables, base typography, `.sf-*` utilities |
| `app/styles/layout.css` | frame, header, mobile menu, footer, aside restyle |
| `app/styles/home.css` | hero, marquee, blog teaser, store carousel |
| `app/lib/marquee.ts` | `computeMarqueeReps` (pure) |
| `app/lib/parallax.ts` | `heroProgress` (pure) |
| `app/components/home/heroLayers.ts` | hero art layer definitions + `layerTransform` (pure) |
| `app/lib/newsletter/validate.ts` | `isValidEmail` |
| `app/lib/newsletter/subscribe.ts` | `subscribe(email, adminFetch)` — Admin API flow, injectable fetch |
| `app/lib/newsletter/admin.ts` | `createAdminFetch(env)` — real Admin GraphQL fetch |
| `app/routes/newsletter.tsx` | POST-only resource route |
| `app/components/NewsletterForm.tsx` | footer form using `useFetcher` |
| `app/components/Frame.tsx` | triple green border wrapper |
| `app/components/Header.tsx` | sticky nav (replaces skeleton file) |
| `app/components/MobileMenu.tsx` | full-screen menu overlay |
| `app/components/Footer.tsx` | footgrid + newsletter + wordmark (replaces skeleton file) |
| `app/components/PageLayout.tsx` | composes Frame/Header/main/Footer + cart & search asides (replaces skeleton file) |
| `app/components/WaveDivider.tsx` | the three SVG wave dividers |
| `app/components/home/Hero.tsx` | hero stage with parallax |
| `app/components/home/Marquee.tsx` | seamless GROW/MAKE/TELL strip |
| `app/components/home/BlogTeaser.tsx` | newest post + two secondary links |
| `app/components/home/StoreCarousel.tsx` | scroll-snap product carousel with quick add |
| `app/routes/_index.tsx` | home route (rewritten) |
| `app/root.tsx` | stylesheet wiring; drop menu queries and `isLoggedIn` |
| `env.d.ts` | `Env` augmentation for the Admin token |
| `vitest.config.ts`, `app/**/*.test.ts` | unit tests |
| `playwright.config.ts`, `e2e/*.spec.ts` | e2e tests against `npm run dev` (mock.shop) |
| `docs/store-setup.md`, `docs/products-placeholder.csv` | owner checklist + seed products |

---

### Task 1: Migrate the repo and scaffold Hydrogen

**Files:**
- Move: `index.html` → `legacy/landing-page.html`
- Delete: `package-lock.json` (stray, no package.json), after scaffold: `.cursor/`, `guides/`, `CHANGELOG.md`, `app/routes/account*.tsx` (10 files), `app/lib/orderFilters.ts`, `app/components/MockShopNotice.tsx`
- Create: `.gitignore`, everything the scaffold produces (`app/`, `public/`, `server.ts`, `vite.config.ts`, `react-router.config.ts`, `package.json`, `tsconfig.json`, `.graphqlrc.ts`, `env.d.ts`, `eslint.config.js`, `.env`, `AGENTS.md`, `CLAUDE.md`, `README.md`)

**Interfaces:**
- Produces: a runnable Hydrogen app at the repo root (`npm run dev` on http://localhost:3000), `npm run typecheck`, `npm run lint`, `npm test` (Vitest, no tests yet), `npm run test:e2e` (Playwright, no tests yet).

- [ ] **Step 1: Create the branch and move the landing page aside**

```bash
git checkout -b hydrogen-storefront
mkdir -p legacy
git mv index.html legacy/landing-page.html
rm -f package-lock.json
git commit -m "Move landing page to legacy/ ahead of Hydrogen scaffold

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 2: Scaffold the skeleton into a temp dir and copy it in**

The CLI refuses non-empty targets, so scaffold elsewhere and copy. These flags are verified to run non-interactively.

```bash
rm -rf /tmp/sf-hydrogen-scaffold
npx --yes @shopify/create-hydrogen@latest --path /tmp/sf-hydrogen-scaffold --mock-shop --language ts --styling none --markets none --routes --no-install-deps --no-git --no-shortcut
rsync -a --exclude node_modules /tmp/sf-hydrogen-scaffold/ ./
rm -rf .cursor guides CHANGELOG.md
rm -f app/routes/account*.tsx app/lib/orderFilters.ts app/components/MockShopNotice.tsx
ls app/routes | grep -c account   # expected: 0
```

- [ ] **Step 3: Add `.gitignore` (the `--no-git` scaffold doesn't write one)**

```gitignore
node_modules
/.cache
/build
/dist
/.react-router
/.shopify
/.mf
.env
.env.*
!.env.example
coverage
playwright-report
test-results
.DS_Store
```

- [ ] **Step 4: Name the package, add test tooling and scripts**

```bash
npm pkg set name=sallyforth
npm install
npm install --save-dev vitest@^3 @playwright/test@^1.55
npm pkg set scripts.test="vitest run" scripts.test:watch="vitest" scripts.test:e2e="playwright test"
npx playwright install chromium
```

- [ ] **Step 5: Remove the mock-shop notice from the home route (it was deleted above)**

In `app/routes/_index.tsx` delete the line `import {MockShopNotice} from '~/components/MockShopNotice';`, the line `{data.isShopLinked ? null : <MockShopNotice />}`, and the line `isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),`. In `app/styles/app.css` delete the whole `.mock-shop-notice { ... }` block (starts at the `.mock-shop-notice` selector, ends at the closing brace before `@media (max-width: 45em)` — remove that media block too if it only contains `.mock-shop-notice` rules). This route is fully rewritten in Task 7; this step only keeps the build green.

- [ ] **Step 6: Verify typecheck, lint, and that dev serves the home page**

```bash
npm run typecheck        # expected: exit 0
npm run lint             # expected: exit 0 (warnings OK)
(npm run dev > /tmp/sf-dev.log 2>&1 &) ; sleep 25
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/   # expected: 200
curl -s http://localhost:3000/ | grep -c "Recommended Products"   # expected: 1
pkill -f "shopify hydrogen dev"
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Scaffold Hydrogen storefront (mock.shop, TS, plain CSS); drop account routes

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Extract the legacy assets into `public/`

**Files:**
- Create: `scripts/extract-legacy-assets.mjs`
- Create (generated): `public/art/*.webp|svg` (17 files), `public/fonts/*.woff2` (8 files)

**Interfaces:**
- Produces: static URLs used by every later task — see the `NAMES` map below; later tasks reference them through `ART`/fonts in `app/config/shop.ts` and `tokens.css`.

- [ ] **Step 1: Write the extraction script**

The bundle stores each asset as `{mime, compressed, data}` under a UUID; `compressed: true` means gzip. Names below were verified against the template (which element uses which UUID).

```js
// scripts/extract-legacy-assets.mjs
// One-time extraction of the assets bundled inside legacy/landing-page.html.
// Usage: node scripts/extract-legacy-assets.mjs
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const SRC = new URL('../legacy/landing-page.html', import.meta.url);
const OUT_ART = new URL('../public/art/', import.meta.url);
const OUT_FONTS = new URL('../public/fonts/', import.meta.url);

// uuid prefix -> output file name
const NAMES = {
  // images (webp unless noted)
  'e849c085': 'tomato.webp',
  '427a0da3': 'carrot.webp',
  '6e8d89b5': 'peapod.webp',
  'cda00be9': 'beet.webp',
  'ff16941d': 'eggplant.webp',
  'a1fcdfbf': 'blueberries.webp',
  '8044f101': 'radish2.webp',
  'd4e1f91a': 'radish-a.webp',
  'dae5a574': 'radish-b.webp',
  '86f4be4b': 'radish-c.webp',
  'd9bb5fff': 'snail.webp',
  'dbe8a70e': 'carrot-big.webp',
  'f0b7e153': 'beet-big.webp',
  '3cd70baa': 'blog-art-left.webp',
  'b0dc3a00': 'blog-tile.webp',
  '23df04bb': 'wordmark-script.svg',
  '7141ed3b': 'wordmark-footer.svg',
  // fonts
  '260aff4a': 'abril-fatface-latin-ext.woff2',
  '7f5342e0': 'abril-fatface-latin.woff2',
  'e5bc1b24': 'libre-caslon-text-italic-latin-ext.woff2',
  'a5009f11': 'libre-caslon-text-italic-latin.woff2',
  '19786190': 'libre-caslon-text-regular-latin-ext.woff2',
  '5534a725': 'libre-caslon-text-regular-latin.woff2',
  '75d445c4': 'libre-caslon-text-bold-latin-ext.woff2',
  '52e7c1fd': 'libre-caslon-text-bold-latin.woff2',
};

const lines = readFileSync(SRC, 'utf8').split('\n');
const manifestLine = lines.findIndex((l) => l.includes('<script type="__bundler/manifest">')) + 1;
const manifest = JSON.parse(lines[manifestLine]);

mkdirSync(OUT_ART, {recursive: true});
mkdirSync(OUT_FONTS, {recursive: true});

let written = 0;
for (const [uuid, entry] of Object.entries(manifest)) {
  const name = NAMES[uuid.slice(0, 8)];
  if (!name) throw new Error(`No name for asset ${uuid} (${entry.mime})`);
  let bytes = Buffer.from(entry.data, 'base64');
  if (entry.compressed) bytes = gunzipSync(bytes);
  const dir = entry.mime.startsWith('font/') ? OUT_FONTS : OUT_ART;
  writeFileSync(new URL(name, dir), bytes);
  written++;
  console.log(`${name.padEnd(44)} ${String(bytes.length).padStart(8)} bytes  ${entry.mime}`);
}
if (written !== Object.keys(NAMES).length) throw new Error(`Expected ${Object.keys(NAMES).length} assets, wrote ${written}`);
console.log(`\nWrote ${written} assets.`);
```

- [ ] **Step 2: Run it and check the output**

```bash
node scripts/extract-legacy-assets.mjs
ls public/art | wc -l      # expected: 17
ls public/fonts | wc -l    # expected: 8
file public/art/wordmark-script.svg public/art/tomato.webp public/fonts/abril-fatface-latin.woff2
# expected: "SVG Scalable Vector Graphics image", "RIFF ... Web/P image", "Web Open Font Format (Version 2)"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/extract-legacy-assets.mjs public/art public/fonts
git commit -m "Extract landing-page art and fonts from the legacy bundle into public/

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Design tokens, fonts, and base styles

**Files:**
- Create: `app/styles/tokens.css`
- Modify: `app/root.tsx` (add the stylesheet link; drop `header`/`footer` menu queries and `isLoggedIn`)
- Modify: `app/components/PageLayout.tsx`, `app/components/Header.tsx`, `app/components/Footer.tsx` — minimal edits so the skeleton still compiles without menus (they are fully replaced in Task 6)

**Interfaces:**
- Produces: CSS variables `--green --red --rust --olive --cream --paper --white --rule --font-display --font-body`, utilities `.sf-pill`, `.sf-eyebrow`, `.sf-section-title`, `.sf-italic-link`, `.sf-hp`; root loader data shape `{cart, publicStoreDomain, shop, consent}`.

- [ ] **Step 1: Write `app/styles/tokens.css`**

```css
/* ---- Fonts (self-hosted, extracted from the landing bundle) ---- */
@font-face { font-family: 'Abril Fatface'; font-style: normal; font-weight: 400; font-display: swap;
  src: url('/fonts/abril-fatface-latin-ext.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: 'Abril Fatface'; font-style: normal; font-weight: 400; font-display: swap;
  src: url('/fonts/abril-fatface-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: 'Libre Caslon Text'; font-style: italic; font-weight: 400; font-display: swap;
  src: url('/fonts/libre-caslon-text-italic-latin-ext.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: 'Libre Caslon Text'; font-style: italic; font-weight: 400; font-display: swap;
  src: url('/fonts/libre-caslon-text-italic-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: 'Libre Caslon Text'; font-style: normal; font-weight: 400; font-display: swap;
  src: url('/fonts/libre-caslon-text-regular-latin-ext.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: 'Libre Caslon Text'; font-style: normal; font-weight: 400; font-display: swap;
  src: url('/fonts/libre-caslon-text-regular-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: 'Libre Caslon Text'; font-style: normal; font-weight: 700; font-display: swap;
  src: url('/fonts/libre-caslon-text-bold-latin-ext.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: 'Libre Caslon Text'; font-style: normal; font-weight: 700; font-display: swap;
  src: url('/fonts/libre-caslon-text-bold-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }

/* ---- Brand tokens ---- */
:root {
  --green: rgb(36, 88, 42);
  --red: #B30C00;
  --rust: #C1440E;
  --olive: #43573A;
  --cream: #FAF9F8;
  --paper: #FFFBEA;
  --white: #FFFFFF;
  --rule: #7A96C3;
  --font-display: 'Abril Fatface', Georgia, serif;
  --font-body: 'Libre Caslon Text', Georgia, serif;
  --prose-size: 17px;
  --prose-leading: 1.75;
  --pad-x: 64px;
}
@media (max-width: 900px) { :root { --pad-x: 24px; } }

/* ---- Base ---- */
html, body { margin: 0; background: var(--white); color: var(--green); font-family: var(--font-body); }
a { color: var(--green); text-decoration: none; }
a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid var(--green); outline-offset: 2px; }
img { max-width: none; } /* app.css sets img{max-width:100%}; the art layers rely on fixed widths */

/* ---- Utilities ---- */
.sf-pill { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; font-family: var(--font-body); letter-spacing: .02em; line-height: 1; cursor: pointer; border: 1px solid transparent; transition: filter .15s; }
.sf-pill:hover { filter: brightness(1.12); }
.sf-pill--red { background: var(--red); border-color: var(--red); color: var(--white); }
.sf-pill--rust { background: var(--rust); border-color: var(--rust); color: var(--white); }
.sf-pill--green { background: var(--green); border-color: var(--green); color: var(--white); }
.sf-pill--olive { background: var(--olive); border-color: var(--olive); color: var(--white); }
.sf-pill--outline { background: transparent; border-color: var(--green); color: var(--green); }
.sf-eyebrow { font: 700 11px var(--font-body); letter-spacing: .3em; color: var(--green); text-transform: uppercase; }
.sf-section-title { font: 34px var(--font-display); color: var(--green); }
.sf-italic-link { font: italic 14px var(--font-body); color: var(--green); border-bottom: 1px solid var(--green); }
.sf-hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
```

- [ ] **Step 2: Wire the stylesheet into `app/root.tsx` and trim the root loader**

In `app/root.tsx`:
1. Add `import tokensStyles from '~/styles/tokens.css?url';` after the `appStyles` import, and in `Layout` add `<link rel="stylesheet" href={tokensStyles}></link>` right after the `appStyles` link.
2. Delete the import `import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';`.
3. Replace `loadCriticalData` and `loadDeferredData` with:

```ts
async function loadCriticalData(_args: Route.LoaderArgs) {
  return {};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const {cart} = context;
  return {
    cart: cart.get(),
  };
}
```

- [ ] **Step 3: Keep the skeleton layout compiling until Task 6 replaces it**

In `app/components/PageLayout.tsx`: remove `footer`, `header`, and `isLoggedIn` from `PageLayoutProps` and the destructuring; delete the `<MobileMenuAside .../>` line and the `MobileMenuAside` function; render `<Header cart={cart} publicStoreDomain={publicStoreDomain} />` and `<Footer />` in place of the old calls; delete the unused `FooterQuery`/`HeaderQuery` type imports and the `HeaderMenu` import.

In `app/components/Header.tsx`: change `HeaderProps` to `{cart: Promise<CartApiQueryFragment | null>; publicStoreDomain: string}`; make `Header` render only `<header className="header"><NavLink prefetch="intent" to="/" end><strong>SallyForth</strong></NavLink><HeaderCtas cart={cart} /></header>`; delete `HeaderMenu`, `FALLBACK_HEADER_MENU`, the `isLoggedIn` `NavLink` block inside `HeaderCtas`, and the now-unused `HeaderQuery`/`Suspense`-of-isLoggedIn code. Keep `HeaderMenuMobileToggle`, `SearchToggle`, `CartBadge`, `CartToggle`, `CartBanner`, `activeLinkStyle`.

Replace `app/components/Footer.tsx` entirely with:

```tsx
export function Footer() {
  return <footer className="footer" />;
}
```

- [ ] **Step 4: Verify fonts load under the CSP and nothing regressed**

```bash
npm run typecheck && npm run lint
(npm run dev > /tmp/sf-dev.log 2>&1 &) ; sleep 25
curl -s http://localhost:3000/ | grep -c 'tokens.css'                          # expected: 1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/fonts/abril-fatface-latin.woff2   # expected: 200
curl -sI http://localhost:3000/ | grep -i content-security-policy | grep -o "font-src[^;]*\|default-src[^;]*"
pkill -f "shopify hydrogen dev"
```

If the CSP output shows a `font-src` that does not include `'self'`, add `fontSrc: ["'self'"]` to the `createContentSecurityPolicy({...})` options object in `app/entry.server.tsx` (alongside `shop`). If there is no `font-src` directive, `default-src 'self'` covers the fonts and no change is needed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add brand tokens and self-hosted fonts; trim root loader to cart only

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Shop config and pure helpers (marquee, parallax) with unit tests

**Files:**
- Create: `app/config/shop.ts`, `app/lib/marquee.ts`, `app/lib/parallax.ts`, `app/components/home/heroLayers.ts`
- Create: `vitest.config.ts`, `app/lib/marquee.test.ts`, `app/lib/parallax.test.ts`, `app/components/home/heroLayers.test.ts`

**Interfaces:**
- Produces:
  - `SHOP: {name: string; tagline: string; handles: {featuredCollection: string; blog: string; almanac: string; about: string}}`
  - `NAV_LINKS: ReadonlyArray<{label: string; to: string; tone: 'red'|'rust'|'green'|'olive'}>`
  - `BLOGS: Record<string, {path: string; title: string; tagline: string; art: [string, string]}>`
  - `ART: Record<string, string>` (asset URL by name, e.g. `ART.tomato === '/art/tomato.webp'`)
  - `computeMarqueeReps(viewportWidth: number, unitWidth: number): number`
  - `heroProgress(scrollY: number, heroBottomAbs: number): number`
  - `type LayerKind`, `HERO_LAYERS: ReadonlyArray<HeroLayer>`, `layerTransform(kind: LayerKind, p: number): string`

- [ ] **Step 1: Vitest config (separate from Vite's, so Hydrogen/Oxygen plugins don't load)**

```ts
// vitest.config.ts
import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  resolve: {alias: {'~': fileURLToPath(new URL('./app', import.meta.url))}},
  test: {
    environment: 'node',
    include: ['app/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Write the failing tests**

```ts
// app/lib/marquee.test.ts
import {describe, expect, it} from 'vitest';
import {computeMarqueeReps} from '~/lib/marquee';

describe('computeMarqueeReps', () => {
  it('repeats the unit until one sequence exceeds the viewport, plus one for safety', () => {
    expect(computeMarqueeReps(1280, 896)).toBe(3); // ceil(1280/896)=2, +1
    expect(computeMarqueeReps(375, 896)).toBe(2);  // ceil(375/896)=1, +1
    expect(computeMarqueeReps(2560, 896)).toBe(4); // ceil(2560/896)=3, +1
  });
  it('never returns less than 1 and survives a zero-width unit', () => {
    expect(computeMarqueeReps(0, 896)).toBe(1);
    expect(computeMarqueeReps(1280, 0)).toBe(1);
  });
});
```

```ts
// app/lib/parallax.test.ts
import {describe, expect, it} from 'vitest';
import {heroProgress} from '~/lib/parallax';

describe('heroProgress', () => {
  it('is 0 at the top and 1 once the hero has scrolled past', () => {
    expect(heroProgress(0, 900)).toBe(0);
    expect(heroProgress(900, 900)).toBe(1);
    expect(heroProgress(5000, 900)).toBe(1);
  });
  it('eases out: 1 - (1-p)^2', () => {
    expect(heroProgress(450, 900)).toBeCloseTo(0.75, 5);
  });
  it('is continuous around the old hardcoded 520px threshold', () => {
    const a = heroProgress(519, 914);
    const b = heroProgress(521, 914);
    expect(b - a).toBeGreaterThan(0);
    expect(b - a).toBeLessThan(0.01);
  });
  it('clamps negative scroll and guards a zero-height hero', () => {
    expect(heroProgress(-50, 900)).toBe(0);
    expect(heroProgress(10, 0)).toBe(1);
  });
});
```

```ts
// app/components/home/heroLayers.test.ts
import {describe, expect, it} from 'vitest';
import {HERO_LAYERS, layerTransform} from '~/components/home/heroLayers';

describe('layerTransform', () => {
  it('matches the landing page recipes at rest (p = 0)', () => {
    expect(layerTransform('A', 0)).toBe('translate(0px, 0px) rotate(18deg)');
    expect(layerTransform('B', 0)).toBe('translate(0px, 0px) rotate(-12deg)');
    expect(layerTransform('T', 0)).toBe('translate(0px, 0px) rotate(180deg)');
    expect(layerTransform('BOTTOM', 0)).toBe('translate(0px, 0px) rotate(-8deg)');
  });
  it('moves layers at full progress', () => {
    expect(layerTransform('A', 1)).toBe('translate(-300px, -120px) rotate(6deg)');
    expect(layerTransform('CL', 1)).toBe('translate(-300px, 60px) rotate(-72deg)');
  });
  it('defines the twelve landing-page art layers', () => {
    expect(HERO_LAYERS).toHaveLength(12);
    for (const layer of HERO_LAYERS) expect(layer.src.startsWith('/art/')).toBe(true);
  });
});
```

- [ ] **Step 3: Run the tests to confirm they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `~/lib/marquee`, `~/lib/parallax`, `~/components/home/heroLayers`.

- [ ] **Step 4: Implement config and helpers**

```ts
// app/config/shop.ts
export const SHOP = {
  name: 'SallyForth',
  tagline: 'Growing families, together',
  handles: {
    featuredCollection: 'frontpage',
    blog: 'blog',
    almanac: 'bits-and-bobs-almanac',
    about: 'about',
  },
} as const;

export type NavTone = 'red' | 'rust' | 'green' | 'olive';

export const NAV_LINKS: ReadonlyArray<{label: string; to: string; tone: NavTone}> = [
  {label: 'Shop', to: '/collections/all', tone: 'red'},
  {label: 'About', to: '/about', tone: 'rust'},
  {label: 'Blog', to: '/blog', tone: 'green'},
  {label: 'Bits and Bobs Almanac', to: '/bits-and-bobs-almanac', tone: 'olive'},
];

export const BLOGS = {
  [SHOP.handles.blog]: {
    path: '/blog',
    title: 'The Blog',
    tagline: 'Stories, crafts, and garden notes from the SallyForth table.',
    art: ['tomato', 'carrot'] as [string, string],
  },
  [SHOP.handles.almanac]: {
    path: '/bits-and-bobs-almanac',
    title: 'Bits and Bobs Almanac',
    tagline: 'Small seasonal things worth knowing: bits, bobs, and what to plant next.',
    art: ['snail', 'radish-a'] as [string, string],
  },
} as const;

const art = (name: string) => `/art/${name}`;
export const ART = {
  tomato: art('tomato.webp'),
  carrot: art('carrot.webp'),
  peapod: art('peapod.webp'),
  beet: art('beet.webp'),
  eggplant: art('eggplant.webp'),
  blueberries: art('blueberries.webp'),
  radish2: art('radish2.webp'),
  radishA: art('radish-a.webp'),
  radishB: art('radish-b.webp'),
  radishC: art('radish-c.webp'),
  snail: art('snail.webp'),
  carrotBig: art('carrot-big.webp'),
  beetBig: art('beet-big.webp'),
  blogArtLeft: art('blog-art-left.webp'),
  blogTile: art('blog-tile.webp'),
  wordmarkScript: art('wordmark-script.svg'),
  wordmarkFooter: art('wordmark-footer.svg'),
} as const;
```

```ts
// app/lib/marquee.ts
/**
 * How many copies of the marquee unit make one sequence at least as wide as
 * the viewport (+1 for safety). The strip renders the sequence twice and
 * animates translateX(-50%), so the loop is seamless at any width.
 */
export function computeMarqueeReps(viewportWidth: number, unitWidth: number): number {
  if (!(viewportWidth > 0) || !(unitWidth > 0)) return 1;
  return Math.max(1, Math.ceil(viewportWidth / unitWidth) + 1);
}
```

```ts
// app/lib/parallax.ts
/**
 * Hero parallax progress in [0,1], derived from the hero's own height so the
 * animation ends exactly when the hero leaves the viewport (no hardcoded
 * scroll distance, no jump). Eased with 1 - (1-p)^2.
 */
export function heroProgress(scrollY: number, heroBottomAbs: number): number {
  const end = Math.max(1, heroBottomAbs);
  const raw = Math.min(1, Math.max(0, scrollY / end));
  return 1 - (1 - raw) * (1 - raw);
}
```

```ts
// app/components/home/heroLayers.ts
import {ART} from '~/config/shop';

export type LayerKind = 'A' | 'B' | 'C' | 'L' | 'R' | 'BOTTOM' | 'CL' | 'BR' | 'T';

export type HeroLayer = {
  kind: LayerKind;
  src: string;
  /** absolute-position CSS for the layer at rest */
  style: {left?: string; right?: string; top?: string; bottom?: string; width: string};
};

const px = (n: number) => `${Math.round(n * 1000) / 1000}px`;
const deg = (n: number) => `${Math.round(n * 1000) / 1000}deg`;

/** Landing-page scroll recipes, verbatim. */
export function layerTransform(kind: LayerKind, p: number): string {
  switch (kind) {
    case 'A':      return `translate(${px(-p * 300)}, ${px(-p * 120)}) rotate(${deg(18 - p * 12)})`;
    case 'B':      return `translate(${px(p * 300)}, ${px(-p * 90)}) rotate(${deg(-12 + p * 14)})`;
    case 'C':      return `translate(0px, ${px(p * 260)}) rotate(${deg(-8 + p * 10)})`;
    case 'L':      return `translate(${px(-p * 300)}, ${px(p * 120)}) rotate(${deg(-p * 12)})`;
    case 'R':      return `translate(${px(p * 300)}, ${px(p * 90)}) rotate(${deg(p * 14)})`;
    case 'BOTTOM': return `translate(0px, ${px(p * 260)}) rotate(${deg(-8 + p * 10)})`;
    case 'CL':     return `translate(${px(-p * 300)}, ${px(p * 60)}) rotate(${deg(-62 - p * 10)})`;
    case 'BR':     return `translate(${px(p * 300)}, ${px(p * 60)}) rotate(${deg(58 + p * 10)})`;
    case 'T':      return `translate(0px, ${px(-p * 260)}) rotate(${deg(180 + p * 10)})`;
  }
}

/** The twelve art layers of the landing-page hero, in DOM order. */
export const HERO_LAYERS: ReadonlyArray<HeroLayer> = [
  {kind: 'A', src: ART.radishA, style: {left: '-260px', top: '-120px', width: '720px'}},
  {kind: 'B', src: ART.radishB, style: {right: '-300px', top: '-80px', width: '760px'}},
  {kind: 'C', src: ART.radishC, style: {left: '32%', bottom: '-360px', width: '720px'}},
  {kind: 'L', src: ART.radishB, style: {left: '-80px', bottom: '-140px', width: '520px'}},
  {kind: 'R', src: ART.radishA, style: {right: '-60px', bottom: '-120px', width: '500px'}},
  {kind: 'T', src: ART.radishC, style: {left: '22%', top: '-300px', width: '520px'}},
  {kind: 'T', src: ART.radishA, style: {right: '18%', top: '-220px', width: '440px'}},
  {kind: 'BOTTOM', src: ART.carrotBig, style: {left: '12%', bottom: '-420px', width: '300px'}},
  {kind: 'BOTTOM', src: ART.carrotBig, style: {right: '10%', bottom: '-460px', width: '340px'}},
  {kind: 'CL', src: ART.carrotBig, style: {left: '-120px', top: '26%', width: '260px'}},
  {kind: 'BOTTOM', src: ART.beetBig, style: {left: '38%', bottom: '-520px', width: '340px'}},
  {kind: 'BR', src: ART.beetBig, style: {right: '-140px', top: '22%', width: '300px'}},
];
```

- [ ] **Step 5: Run the tests to confirm they pass**

Run: `npm test`
Expected: 3 files, all tests PASS. Then `npm run typecheck` — exit 0.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts app/config app/lib/marquee.ts app/lib/marquee.test.ts app/lib/parallax.ts app/lib/parallax.test.ts app/components/home/heroLayers.ts app/components/home/heroLayers.test.ts
git commit -m "Add shop config and pure marquee/parallax helpers with unit tests

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Newsletter — Admin API subscribe flow, resource route, and form

**Files:**
- Create: `app/lib/newsletter/validate.ts`, `app/lib/newsletter/subscribe.ts`, `app/lib/newsletter/admin.ts`
- Create: `app/lib/newsletter/validate.test.ts`, `app/lib/newsletter/subscribe.test.ts`
- Create: `app/routes/newsletter.tsx`, `app/components/NewsletterForm.tsx`
- Modify: `env.d.ts` (declare `PRIVATE_ADMIN_API_ACCESS_TOKEN`)

**Interfaces:**
- Produces:
  - `isValidEmail(email: string): boolean`
  - `type AdminFetch = (query: string, variables: Record<string, unknown>) => Promise<{data?: any; errors?: unknown}>`
  - `subscribe(email: string, adminFetch: AdminFetch): Promise<SubscribeResult>` where `type SubscribeResult = {ok: true} | {ok: false; error: string}`
  - `createAdminFetch(env: {PUBLIC_STORE_DOMAIN?: string; PRIVATE_ADMIN_API_ACCESS_TOKEN?: string}): AdminFetch | null`
  - Route `POST /newsletter` → JSON `SubscribeResult` (400 on validation failure, 502 on Admin API failure); `GET /newsletter` → 302 to `/`
  - `<NewsletterForm />` (no props)

- [ ] **Step 1: Write the failing tests**

```ts
// app/lib/newsletter/validate.test.ts
import {describe, expect, it} from 'vitest';
import {isValidEmail} from '~/lib/newsletter/validate';

describe('isValidEmail', () => {
  it('accepts ordinary addresses', () => {
    expect(isValidEmail('sally@example.com')).toBe(true);
    expect(isValidEmail('first.last+tag@sub.example.co.uk')).toBe(true);
  });
  it('rejects junk', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('has space@example.com')).toBe(false);
    expect(isValidEmail('x'.repeat(250) + '@e.com')).toBe(false);
  });
});
```

```ts
// app/lib/newsletter/subscribe.test.ts
import {describe, expect, it, vi} from 'vitest';
import {subscribe, type AdminFetch} from '~/lib/newsletter/subscribe';

function fakeAdmin(responses: Array<{data?: any; errors?: unknown}>) {
  const calls: Array<{query: string; variables: Record<string, unknown>}> = [];
  const fetch: AdminFetch = vi.fn(async (query, variables) => {
    calls.push({query, variables});
    return responses.shift() ?? {data: {}};
  });
  return {fetch, calls};
}

describe('subscribe', () => {
  it('creates a subscribed customer tagged newsletter', async () => {
    const {fetch, calls} = fakeAdmin([
      {data: {customerCreate: {customer: {id: 'gid://shopify/Customer/1'}, userErrors: []}}},
    ]);
    await expect(subscribe('sally@example.com', fetch)).resolves.toEqual({ok: true});
    expect(calls).toHaveLength(1);
    expect(calls[0].query).toContain('customerCreate');
    expect(calls[0].variables).toEqual({
      input: {
        email: 'sally@example.com',
        tags: ['newsletter'],
        emailMarketingConsent: {marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN'},
      },
    });
  });

  it('updates consent when the email already exists', async () => {
    const {fetch, calls} = fakeAdmin([
      {data: {customerCreate: {customer: null, userErrors: [{field: ['email'], message: 'Email has already been taken'}]}}},
      {data: {customers: {nodes: [{id: 'gid://shopify/Customer/7'}]}}},
      {data: {customerEmailMarketingConsentUpdate: {customer: {id: 'gid://shopify/Customer/7'}, userErrors: []}}},
    ]);
    await expect(subscribe('sally@example.com', fetch)).resolves.toEqual({ok: true});
    expect(calls).toHaveLength(3);
    expect(calls[1].variables).toEqual({q: 'email:"sally@example.com"'});
    expect(calls[2].variables).toEqual({
      input: {
        customerId: 'gid://shopify/Customer/7',
        emailMarketingConsent: {marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN'},
      },
    });
  });

  it('reports a friendly error on other user errors', async () => {
    const {fetch} = fakeAdmin([
      {data: {customerCreate: {customer: null, userErrors: [{field: ['email'], message: 'Email is invalid'}]}}},
    ]);
    await expect(subscribe('sally@example.com', fetch)).resolves.toEqual({
      ok: false,
      error: "Hmm, that didn't take — try again in a moment.",
    });
  });

  it('reports a friendly error when the API throws or returns errors', async () => {
    const throwing: AdminFetch = async () => { throw new Error('boom'); };
    await expect(subscribe('sally@example.com', throwing)).resolves.toMatchObject({ok: false});
    const {fetch} = fakeAdmin([{errors: [{message: 'unauthorized'}]}]);
    await expect(subscribe('sally@example.com', fetch)).resolves.toMatchObject({ok: false});
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `~/lib/newsletter/validate` and `~/lib/newsletter/subscribe`.

- [ ] **Step 3: Implement validate, subscribe, admin**

```ts
// app/lib/newsletter/validate.ts
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return typeof email === 'string' && email.length <= 254 && EMAIL.test(email);
}
```

```ts
// app/lib/newsletter/subscribe.ts
export type AdminFetch = (
  query: string,
  variables: Record<string, unknown>,
) => Promise<{data?: any; errors?: unknown}>;

export type SubscribeResult = {ok: true} | {ok: false; error: string};

export const FRIENDLY_ERROR = "Hmm, that didn't take — try again in a moment.";

const CONSENT = {marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN'};

const CREATE = `#graphql
  mutation NewsletterCustomerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

const FIND = `#graphql
  query NewsletterFindCustomer($q: String!) {
    customers(first: 1, query: $q) { nodes { id } }
  }
`;

const UPDATE_CONSENT = `#graphql
  mutation NewsletterConsentUpdate($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

type UserError = {field?: string[] | null; message: string};

/**
 * Subscribe an email to marketing via the Admin API:
 * create the customer with consent; if the email is taken, look the customer
 * up and update consent instead. Never throws — returns a friendly result.
 */
export async function subscribe(email: string, adminFetch: AdminFetch): Promise<SubscribeResult> {
  try {
    const created = await adminFetch(CREATE, {
      input: {email, tags: ['newsletter'], emailMarketingConsent: CONSENT},
    });
    if (created.errors) return fail('customerCreate errors', created.errors);
    const errs: UserError[] = created.data?.customerCreate?.userErrors ?? [];
    if (errs.length === 0 && created.data?.customerCreate?.customer?.id) return {ok: true};

    const taken = errs.some((e) => /taken/i.test(e.message));
    if (!taken) return fail('customerCreate userErrors', errs);

    const found = await adminFetch(FIND, {q: `email:"${email}"`});
    const id: string | undefined = found.data?.customers?.nodes?.[0]?.id;
    if (!id) return fail('customer lookup found nothing', found);

    const updated = await adminFetch(UPDATE_CONSENT, {
      input: {customerId: id, emailMarketingConsent: CONSENT},
    });
    const updErrs: UserError[] = updated.data?.customerEmailMarketingConsentUpdate?.userErrors ?? [];
    if (updated.errors || updErrs.length) return fail('consent update failed', updated.errors ?? updErrs);
    return {ok: true};
  } catch (err) {
    return fail('admin fetch threw', err);
  }
}

function fail(why: string, detail: unknown): SubscribeResult {
  console.error(`[newsletter] ${why}:`, JSON.stringify(detail));
  return {ok: false, error: FRIENDLY_ERROR};
}
```

```ts
// app/lib/newsletter/admin.ts
import type {AdminFetch} from '~/lib/newsletter/subscribe';

export const ADMIN_API_VERSION = '2026-04';

/**
 * Real Admin GraphQL fetch bound to the store + private token.
 * Returns null when not configured so callers can degrade gracefully.
 */
export function createAdminFetch(env: {
  PUBLIC_STORE_DOMAIN?: string;
  PRIVATE_ADMIN_API_ACCESS_TOKEN?: string;
}): AdminFetch | null {
  const domain = env.PUBLIC_STORE_DOMAIN;
  const token = env.PRIVATE_ADMIN_API_ACCESS_TOKEN;
  if (!domain || !token || domain === 'mock.shop') return null;
  const url = `https://${domain}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
  return async (query, variables) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token},
      body: JSON.stringify({query, variables}),
    });
    if (!res.ok) throw new Error(`Admin API ${res.status}`);
    return (await res.json()) as {data?: any; errors?: unknown};
  };
}
```

Append to `env.d.ts`:

```ts
declare global {
  interface Env {
    /** Admin API token for the newsletter custom app (write_customers). Server-only. */
    PRIVATE_ADMIN_API_ACCESS_TOKEN?: string;
  }
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

Run: `npm test`
Expected: all PASS (5 files).

- [ ] **Step 5: Add the resource route and the form component**

```tsx
// app/routes/newsletter.tsx
import {data, redirect} from 'react-router';
import type {Route} from './+types/newsletter';
import {isValidEmail} from '~/lib/newsletter/validate';
import {subscribe, FRIENDLY_ERROR, type SubscribeResult} from '~/lib/newsletter/subscribe';
import {createAdminFetch} from '~/lib/newsletter/admin';

export function loader() {
  return redirect('/');
}

export async function action({request, context}: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const honeypot = String(form.get('website') ?? '');

  // Bots fill the hidden field; pretend it worked and do nothing.
  if (honeypot) return data<SubscribeResult>({ok: true});

  if (!isValidEmail(email)) {
    return data<SubscribeResult>({ok: false, error: 'Please enter a valid email address.'}, {status: 400});
  }

  const adminFetch = createAdminFetch(context.env);
  if (!adminFetch) {
    console.error('[newsletter] PRIVATE_ADMIN_API_ACCESS_TOKEN / PUBLIC_STORE_DOMAIN not configured');
    return data<SubscribeResult>({ok: false, error: FRIENDLY_ERROR}, {status: 502});
  }

  const result = await subscribe(email, adminFetch);
  return data<SubscribeResult>(result, {status: result.ok ? 200 : 502});
}
```

```tsx
// app/components/NewsletterForm.tsx
import {useId} from 'react';
import {useFetcher} from 'react-router';
import type {action} from '~/routes/newsletter';

export function NewsletterForm() {
  const fetcher = useFetcher<typeof action>();
  const inputId = useId();
  const busy = fetcher.state !== 'idle';
  const result = fetcher.data;

  if (result?.ok) {
    return <p className="sf-newsletter__done" role="status">You&rsquo;re in 🌱</p>;
  }

  return (
    <fetcher.Form method="post" action="/newsletter" className="sf-newsletter" noValidate>
      <label htmlFor={inputId} className="sr-only">Email address</label>
      <input
        id={inputId}
        className="sf-newsletter__input"
        type="email"
        name="email"
        placeholder="email address"
        autoComplete="email"
        required
      />
      <input className="sf-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="sf-newsletter__button" type="submit" disabled={busy}>
        {busy ? 'SIGNING UP…' : 'SIGN UP'}
      </button>
      {result && !result.ok ? (
        <p className="sf-newsletter__error" role="alert">{result.error}</p>
      ) : null}
    </fetcher.Form>
  );
}
```

- [ ] **Step 6: Verify the route by hand (mock.shop → "not configured" path)**

```bash
npm run typecheck
(npm run dev > /tmp/sf-dev.log 2>&1 &) ; sleep 25
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/newsletter                      # expected: 302
curl -s -w "\n%{http_code}\n" -X POST -d "email=not-an-email" http://localhost:3000/newsletter  # expected: {"ok":false,"error":"Please enter a valid email address."} 400
curl -s -w "\n%{http_code}\n" -X POST -d "email=sally@example.com" http://localhost:3000/newsletter   # expected: {"ok":false,"error":"Hmm, that didn't take — try again in a moment."} 502
curl -s -w "\n%{http_code}\n" -X POST -d "email=sally@example.com&website=spam" http://localhost:3000/newsletter   # expected: {"ok":true} 200
pkill -f "shopify hydrogen dev"
```

- [ ] **Step 7: Commit**

```bash
git add app/lib/newsletter app/routes/newsletter.tsx app/components/NewsletterForm.tsx env.d.ts
git commit -m "Add newsletter signup: Admin API subscribe flow, resource route, footer form

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Shared layout — Frame, Header, MobileMenu, Footer, PageLayout

**Files:**
- Create: `app/components/Frame.tsx`, `app/components/MobileMenu.tsx`, `app/components/WaveDivider.tsx`, `app/styles/layout.css`
- Replace: `app/components/Header.tsx`, `app/components/Footer.tsx`, `app/components/PageLayout.tsx`
- Modify: `app/root.tsx` (link `layout.css`)
- Modify: `app/styles/app.css` (delete the skeleton `.header*` and `.footer*` rules — from the `.header {` selector through the end of `.footer-menu a { ... }`)

**Interfaces:**
- Consumes: `NAV_LINKS`, `ART`, `SHOP` from `~/config/shop`; `useAside`/`Aside` from `~/components/Aside`; `NewsletterForm`; `CartApiQueryFragment` from `storefrontapi.generated`.
- Produces: `<PageLayout cart publicStoreDomain>{children}</PageLayout>`, `<Frame>`, `<Header cart>`, `<MobileMenu>`, `<Footer>`, `<WaveDivider variant="blog"|"store"|"footer" fill="white"|"cream" />`. CSS classes `sf-frame`, `sf-header`, `sf-nav`, `sf-menu`, `sf-footer`, `sf-footgrid`, `sf-footcopy`, `sf-section-head`, `sf-art`.

- [ ] **Step 1: `Frame` and `WaveDivider`**

```tsx
// app/components/Frame.tsx
/** The landing page's triple green border, wrapping the whole site. */
export function Frame({children}: {children: React.ReactNode}) {
  return (
    <div className="sf-frame">
      <div className="sf-frame__outer">
        <div className="sf-frame__inner">{children}</div>
      </div>
    </div>
  );
}
```

```tsx
// app/components/WaveDivider.tsx
const PATHS = {
  blog: 'M0,32 C150,64 300,0 450,28 C600,56 750,8 900,30 C1050,52 1150,20 1200,28 L1200,60 L0,60 Z',
  store: 'M0,28 C160,58 320,4 480,26 C640,48 800,10 960,30 C1080,44 1150,22 1200,26 L1200,60 L0,60 Z',
  footer: 'M0,20 C200,60 400,0 600,30 C800,60 1000,0 1200,24 L1200,60 L0,60 Z',
} as const;

const FILLS = {white: 'var(--white)', cream: 'var(--cream)'} as const;

/** Sits at the top edge of a section and waves into the section above it. */
export function WaveDivider({variant, fill}: {variant: keyof typeof PATHS; fill: keyof typeof FILLS}) {
  return (
    <svg className="sf-wave" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
      <path fill={FILLS[fill]} d={PATHS[variant]} />
    </svg>
  );
}
```

- [ ] **Step 2: `Header` (replace the whole file)**

```tsx
// app/components/Header.tsx
import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue} from 'react-router';
import {type CartViewPayload, useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {ART, NAV_LINKS, SHOP} from '~/config/shop';

export function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 8H6.2" />
      <circle cx="10" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function Header({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  const {open} = useAside();
  return (
    <div className="sf-header">
      <div className="sf-nav">
        <Link to="/" prefetch="intent" className="sf-nav__logo" aria-label={`${SHOP.name} home`}>
          <img src={ART.tomato} alt="" width="56" height="56" />
        </Link>
        <nav className="sf-nav__links" aria-label="Primary">
          {NAV_LINKS.map((item) => (
            <NavLink key={item.to} to={item.to} prefetch="intent" className={`sf-pill sf-pill--${item.tone} sf-nav__pill`}>
              {item.label}
            </NavLink>
          ))}
          <button type="button" className="sf-nav__icon" onClick={() => open('search')} aria-label="Search">
            <SearchIcon />
          </button>
          <CartToggle cart={cart} />
        </nav>
        <button
          type="button"
          className="sf-burger"
          onClick={() => open('mobile')}
          aria-label="Menu"
          aria-haspopup="dialog"
        >
          <span /><span /><span />
        </button>
      </div>
    </div>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <a
      href="/cart"
      className="sf-nav__icon"
      aria-label={`Cart (${count})`}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {cart, prevCart, shop, url: window.location.href || ''} as CartViewPayload);
      }}
    >
      <CartIcon />
      {count > 0 ? <span className="sf-nav__count">{count}</span> : null}
    </a>
  );
}

export function CartToggle({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
```

- [ ] **Step 3: `MobileMenu`**

```tsx
// app/components/MobileMenu.tsx
import {useEffect, useRef} from 'react';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartIcon} from '~/components/Header';
import {ART, NAV_LINKS} from '~/config/shop';

const MENU_ART: Array<{src: string; style: React.CSSProperties}> = [
  {src: ART.radishB, style: {right: '-160px', top: '-40px', width: 420, transform: 'rotate(200deg)'}},
  {src: ART.radishB, style: {left: '-160px', top: '-40px', width: 420, transform: 'scaleX(-1) rotate(200deg)'}},
  {src: ART.radishB, style: {left: '-200px', top: '38%', width: 460, transform: 'scaleX(-1) rotate(-110deg)'}},
  {src: ART.radishB, style: {left: '-150px', bottom: '-240px', width: 440, transform: 'scaleX(-1) rotate(-40deg)'}},
  {src: ART.radishA, style: {left: '30%', top: '-300px', width: 420, transform: 'rotate(180deg)'}},
  {src: ART.radishB, style: {right: '-200px', top: '38%', width: 460, transform: 'rotate(-110deg)'}},
  {src: ART.radishC, style: {left: '34%', bottom: '-320px', width: 440, transform: 'rotate(-6deg)'}},
  {src: ART.radishB, style: {right: '-150px', bottom: '-240px', width: 440, transform: 'rotate(-40deg)'}},
];

/** Full-screen menu (≤760px). Opens via useAside().open('mobile'). */
export function MobileMenu() {
  const {type, open, close} = useAside();
  const isOpen = type === 'mobile';
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab' && panel.current) {
        const focusables = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="sf-menu" role="dialog" aria-modal="true" aria-label="Menu" ref={panel}>
      {MENU_ART.map((a, i) => (
        <img key={i} src={a.src} alt="" className="sf-menu__art" style={a.style} />
      ))}
      <button ref={closeButton} type="button" className="sf-menu__close" onClick={close} aria-label="Close menu">×</button>
      <div className="sf-menu__links">
        {NAV_LINKS.map((item) => (
          <Link key={item.to} to={item.to} onClick={close} className={`sf-pill sf-pill--${item.tone} sf-menu__pill`}>
            {item.label}
          </Link>
        ))}
        <button type="button" className="sf-pill sf-pill--outline sf-menu__pill" onClick={() => open('search')}>
          Search
        </button>
        <button type="button" className="sf-pill sf-pill--outline sf-menu__pill" onClick={() => open('cart')}>
          <CartIcon /> Cart
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `Footer` (replace the whole file)**

```tsx
// app/components/Footer.tsx
import {Link} from 'react-router';
import {NewsletterForm} from '~/components/NewsletterForm';
import {WaveDivider} from '~/components/WaveDivider';
import {ART, BLOGS, SHOP} from '~/config/shop';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="sf-footer foot">
      <WaveDivider variant="footer" fill="white" />
      <div className="sf-footgrid pad">
        <div>
          <div className="sf-footer__title">Join the garden party</div>
          <p className="sf-footer__blurb">One letter a week: a craft, a garden note, and a story to tell at dinner.</p>
          <NewsletterForm />
        </div>
        <div className="sf-footer__col">
          <div className="sf-eyebrow">Explore</div>
          <Link to={BLOGS[SHOP.handles.blog].path}>The Blog</Link>
          <Link to={BLOGS[SHOP.handles.almanac].path}>Bits and Bobs Almanac</Link>
          <Link to="/collections/all">The Store</Link>
        </div>
        <div className="sf-footer__col">
          <div className="sf-eyebrow">Meet us</div>
          <Link to="/about">About</Link>
          <Link to="/policies">Policies</Link>
        </div>
        <div className="sf-footer__col">
          <div className="sf-eyebrow">Connect</div>
          <a href="https://www.instagram.com/" rel="noopener noreferrer" target="_blank">Instagram</a>
          <a href="https://www.pinterest.com/" rel="noopener noreferrer" target="_blank">Pinterest</a>
          <a href="#newsletter" onClick={(e) => { e.preventDefault(); document.querySelector<HTMLInputElement>('.sf-newsletter__input')?.focus(); }}>Newsletter</a>
        </div>
      </div>
      <div className="sf-footcopy pad">
        <span>© {year} {SHOP.name} · grown with love</span>
        <span><Link to="/policies/privacy-policy">Privacy</Link> · <Link to="/policies/terms-of-service">Terms</Link></span>
      </div>
      <div className="sf-footer__wordmark">
        <img src={ART.wordmarkFooter} alt={SHOP.name} />
        <img src={ART.snail} alt="" className="sf-footer__snail" />
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: `PageLayout` (replace the whole file) and root wiring**

```tsx
// app/components/PageLayout.tsx
import {Await, Link} from 'react-router';
import {Suspense, useId} from 'react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {CartMain} from '~/components/CartMain';
import {Footer} from '~/components/Footer';
import {Frame} from '~/components/Frame';
import {Header} from '~/components/Header';
import {MobileMenu} from '~/components/MobileMenu';
import {SEARCH_ENDPOINT, SearchFormPredictive} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({cart, children = null}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenu />
      <a className="sf-skip" href="#main">Skip to content</a>
      <Frame>
        <Header cart={cart} />
        <main id="main">{children}</main>
        <Footer />
      </Frame>
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="Your basket">
      <Suspense fallback={<p>Loading cart …</p>}>
        <Await resolve={cart}>{(cart) => <CartMain cart={cart} layout="aside" />}</Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="Search">
      <div className="predictive-search">
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <input name="q" onChange={fetchResults} onFocus={fetchResults} placeholder="Search" ref={inputRef} type="search" list={queriesDatalistId} />
              &nbsp;
              <button onClick={goToSearch}>Search</button>
            </>
          )}
        </SearchFormPredictive>
        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;
            if (state === 'loading' && term.current) return <div>Loading…</div>;
            if (!total) return <SearchResultsPredictive.Empty term={term} />;
            return (
              <>
                <SearchResultsPredictive.Queries queries={queries} queriesDatalistId={queriesDatalistId} />
                <SearchResultsPredictive.Products products={products} closeSearch={closeSearch} term={term} />
                <SearchResultsPredictive.Collections collections={collections} closeSearch={closeSearch} term={term} />
                <SearchResultsPredictive.Pages pages={pages} closeSearch={closeSearch} term={term} />
                <SearchResultsPredictive.Articles articles={articles} closeSearch={closeSearch} term={term} />
                {term.current && total ? (
                  <Link onClick={closeSearch} to={`${SEARCH_ENDPOINT}?q=${term.current}`}>
                    <p>View all results for <q>{term.current}</q> →</p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}
```

In `app/root.tsx`: add `import layoutStyles from '~/styles/layout.css?url';` and a `<link rel="stylesheet" href={layoutStyles}></link>` after the tokens link.

- [ ] **Step 6: `app/styles/layout.css`**

```css
/* ---- Skip link ---- */
.sf-skip { position: absolute; left: -9999px; top: 8px; z-index: 100; background: var(--green); color: var(--white); padding: 8px 14px; border-radius: 999px; }
.sf-skip:focus { left: 12px; }

/* ---- Frame (triple green border). overflow-x: clip — not hidden — so the
   sticky header still sticks to the viewport. ---- */
.sf-frame { padding: 10px; background: var(--white); }
.sf-frame__outer { border: 3px solid var(--green); padding: 3px; }
.sf-frame__inner { border: 1px solid var(--green); overflow-x: clip; position: relative; isolation: isolate; }

/* ---- Header ---- */
.sf-header { position: sticky; top: 0; z-index: 20; background: rgba(255,255,255,.86); backdrop-filter: saturate(1.2) blur(10px); -webkit-backdrop-filter: saturate(1.2) blur(10px); box-shadow: 0 1px 0 rgba(36,88,42,.18); }
.sf-nav { display: flex; align-items: center; justify-content: space-between; padding: 10px 44px; }
.sf-nav__logo img { height: 56px; width: auto; display: block; }
.sf-nav__links { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; align-items: center; }
.sf-nav__pill { height: 36px; padding: 0 18px; font-size: 14px; }
.sf-nav__icon { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 999px; color: var(--green); background: none; border: 0; cursor: pointer; transition: background .15s; }
.sf-nav__icon:hover { background: rgba(36,88,42,.08); }
.sf-nav__count { position: absolute; top: -2px; right: -2px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: var(--red); color: var(--white); font: 700 11px/18px var(--font-body); text-align: center; }
.sf-burger { display: none; flex-direction: column; gap: 5px; padding: 6px; background: none; border: 0; cursor: pointer; }
.sf-burger span { display: block; width: 24px; height: 2px; background: var(--green); }
@media (max-width: 900px) { .sf-nav { padding-left: 24px; padding-right: 24px; } }
@media (max-width: 760px) { .sf-nav__links { display: none; } .sf-burger { display: flex; } }

/* ---- Mobile menu ---- */
.sf-menu { position: fixed; inset: 0; height: 100vh; height: 100dvh; z-index: 50; background: rgba(255,255,255,.97); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 24px; overflow: hidden; }
.sf-menu__art { position: absolute; pointer-events: none; }
.sf-menu__close { z-index: 1; position: absolute; top: 18px; right: 20px; width: 40px; height: 40px; border: 0; background: none; color: var(--green); font: 28px/1 sans-serif; cursor: pointer; }
.sf-menu__links { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.sf-menu__pill { height: 52px; padding: 0 28px; font-size: 18px; gap: 10px; }

/* ---- Section chrome shared by home + content pages ---- */
.pad { padding-left: var(--pad-x); padding-right: var(--pad-x); }
.sf-wave { position: absolute; left: 0; top: 1px; width: 100%; height: 60px; display: block; transform: translateY(-100%); }
.sf-art { position: absolute; pointer-events: none; z-index: 0; }
.sf-section-head { position: relative; z-index: 3; display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 8px; }
@media (max-width: 900px) { .sf-art { display: none; } }

/* ---- Footer ---- */
.sf-footer { position: relative; background: var(--white); color: var(--green); }
.sf-footgrid { position: relative; z-index: 3; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; padding-top: 56px; padding-bottom: 40px; }
.sf-footer__title { font: 26px var(--font-display); margin-bottom: 12px; }
.sf-footer__blurb { font: 14px/1.7 var(--font-body); margin: 0 0 18px; }
.sf-footer__col { display: flex; flex-direction: column; gap: 10px; font: 14px var(--font-body); }
.sf-footer__col .sf-eyebrow { margin-bottom: 6px; letter-spacing: .28em; }
.sf-footcopy { display: flex; justify-content: space-between; padding-bottom: 14px; font: italic 12px var(--font-body); flex-wrap: wrap; gap: 8px; }
.sf-footer__wordmark { position: relative; padding: 0 24px 12px; }
.sf-footer__wordmark > img:first-child { width: 100%; display: block; }
.sf-footer__snail { position: absolute; left: 82%; bottom: calc(48% + 24px); width: 5%; }
.sf-newsletter { display: flex; }
.sf-newsletter__input { flex: 1; min-width: 0; background: var(--cream); color: var(--green); font: italic 13px var(--font-body); padding: 12px 16px; border: 0; border-radius: 999px 0 0 999px; }
.sf-newsletter__button { background: var(--red); color: var(--paper); font: 700 12px var(--font-body); letter-spacing: .16em; padding: 0 22px; border: 0; border-radius: 0 999px 999px 0; cursor: pointer; }
.sf-newsletter__button:disabled { opacity: .7; cursor: default; }
.sf-newsletter__error, .sf-newsletter__done { font: italic 13px var(--font-body); margin: 10px 0 0; flex-basis: 100%; }
.sf-newsletter { flex-wrap: wrap; }
@media (max-width: 900px) {
  .sf-footgrid { grid-template-columns: 1fr 1fr; }
  .sf-footgrid > div:first-child { grid-column: 1 / -1; }
}
/* Footer mobile cutoff fix: one column, centered (spec §7 / PR #6) */
@media (max-width: 600px) {
  .sf-footgrid { grid-template-columns: 1fr; }
  .foot .sf-footgrid > div { text-align: center; align-items: center; }
  .foot .sf-footcopy { justify-content: center; text-align: center; }
  .sf-newsletter { justify-content: center; }
}

/* ---- Asides (cart / search drawers): brand the skeleton drawer ---- */
aside { background: var(--cream); border-left: 3px solid var(--green); color: var(--green); }
aside header h3 { font: 22px var(--font-display); color: var(--green); }
aside header .close { color: var(--green); }
```

- [ ] **Step 7: Remove the dead skeleton header/footer CSS, then verify**

In `app/styles/app.css` delete every rule whose selector starts with `.header` or `.footer` (from `.header {` through the end of `.footer-menu a {...}`).

```bash
npm run typecheck && npm run lint && npm test
(npm run dev > /tmp/sf-dev.log 2>&1 &) ; sleep 25
curl -s http://localhost:3000/ | grep -o 'class="sf-frame"' | head -1        # expected: class="sf-frame"
curl -s http://localhost:3000/ | grep -c 'Bits and Bobs Almanac'             # expected: ≥2 (nav + footer)
curl -s http://localhost:3000/ | grep -c 'Join the garden party'             # expected: 1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/collections/all   # expected: 200 (skeleton page inside the frame)
pkill -f "shopify hydrogen dev"
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add shared layout: frame, sticky nav, mobile menu, footer with newsletter

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Home page — Hero (parallax) and Marquee

**Files:**
- Create: `app/components/home/Hero.tsx`, `app/components/home/Marquee.tsx`, `app/styles/home.css`
- Replace: `app/routes/_index.tsx`

**Interfaces:**
- Consumes: `HERO_LAYERS`, `layerTransform` (Task 4); `heroProgress`; `computeMarqueeReps`; `ART`, `SHOP`.
- Produces: `<Hero />`, `<Marquee />`; home route with `links()` for `home.css` and `meta`. Task 8 adds the loader and two more sections to this same route file.

- [ ] **Step 1: `Hero`**

```tsx
// app/components/home/Hero.tsx
import {useEffect, useRef} from 'react';
import {Link} from 'react-router';
import {ART, SHOP} from '~/config/shop';
import {heroProgress} from '~/lib/parallax';
import {HERO_LAYERS, layerTransform} from '~/components/home/heroLayers';

export function Hero() {
  const hero = useRef<HTMLDivElement>(null);
  const layers = useRef<Array<HTMLImageElement | null>>([]);

  useEffect(() => {
    const el = hero.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const apply = () => {
      ticking = false;
      const y = window.scrollY || 0;
      const p = heroProgress(y, el.getBoundingClientRect().bottom + y);
      HERO_LAYERS.forEach((layer, i) => {
        const img = layers.current[i];
        if (img) img.style.transform = layerTransform(layer.kind, p);
      });
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    apply();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="hero" className="sf-hero" ref={hero} aria-label={SHOP.tagline}>
      {HERO_LAYERS.map((layer, i) => (
        <img
          key={i}
          ref={(node) => { layers.current[i] = node; }}
          src={layer.src}
          alt=""
          className="sf-hero__layer"
          style={{...layer.style, transform: layerTransform(layer.kind, 0)}}
        />
      ))}
      <div className="sf-hero__text">
        <div className="sf-hero__halo halo">
          <div className="sf-hero__eyebrow">ART · GARDENS · STORIES</div>
          <div className="sf-hero__wordmark">
            <div className="sf-hero__wordmark-inner">
              <img src={ART.wordmarkScript} alt={SHOP.name} />
              <img src={ART.snail} alt="" className="sf-hero__snail" />
              <p className="sf-hero__tagline">Into the garden of creativity</p>
            </div>
          </div>
          <div className="sf-hero__ctas">
            <Link to="/collections/all" className="sf-hero__cta">SHOP THE STORE</Link>
            <Link to="/blog" className="sf-hero__alt">or start with the blog</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `Marquee`**

```tsx
// app/components/home/Marquee.tsx
import {useEffect, useRef, useState} from 'react';
import {ART} from '~/config/shop';
import {computeMarqueeReps} from '~/lib/marquee';

const ITEMS: Array<[string, string, number]> = [
  ['GROW', ART.carrot, 26], ['MAKE', ART.tomato, 24], ['TELL', ART.peapod, 26],
  ['GROW', ART.beet, 26], ['MAKE', ART.eggplant, 26], ['TELL', ART.blueberries, 22],
];

function Unit() {
  return (
    <div className="sf-marquee__unit">
      {ITEMS.map(([word, src, h], i) => (
        <span key={i} className="sf-marquee__item">
          <span>{word}</span>
          <img src={src} alt="" style={{height: h}} />
        </span>
      ))}
    </div>
  );
}

/**
 * Seamless strip: one sequence = enough units to exceed the viewport (+1);
 * the sequence is rendered twice and animated by -50%. Rebuilds on resize and
 * after fonts load. Static under prefers-reduced-motion (CSS).
 */
export function Marquee() {
  const track = useRef<HTMLDivElement>(null);
  const [reps, setReps] = useState(1);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const unit = el.querySelector<HTMLElement>('.sf-marquee__unit');
      const unitW = unit?.getBoundingClientRect().width ?? 0;
      setReps(computeMarqueeReps(window.innerWidth, unitW));
    };
    measure();
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(t); t = setTimeout(measure, 200); };
    window.addEventListener('resize', onResize, {passive: true});
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, []);

  const copies = Array.from({length: reps * 2}, (_, i) => <Unit key={i} />);
  return (
    <div className="sf-marquee" aria-hidden="true">
      <div className="sf-marquee__track" ref={track} style={{animationDuration: `${28 * reps}s`}}>
        {copies}
      </div>
      <p className="sr-only">Grow, make, tell.</p>
    </div>
  );
}
```

- [ ] **Step 3: `app/styles/home.css`**

```css
/* ---- Hero ---- */
.sf-hero { position: relative; height: calc(100vh - 80px); min-height: 560px; overflow: hidden; background: var(--green); border-bottom: 1px solid var(--green); }
.sf-hero__layer { position: absolute; pointer-events: none; will-change: transform; }
.sf-hero__text { position: absolute; inset: 0; z-index: 3; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.sf-hero__halo { background: radial-gradient(ellipse 52% 50% at 50% 50%, rgba(36,88,42,.9) 42%, rgba(36,88,42,.77) 62%, rgba(36,88,42,.44) 80%, rgba(36,88,42,0) 96%); padding: 110px 140px; }
.sf-hero__eyebrow { font: 700 12px var(--font-body); letter-spacing: .34em; color: var(--white); margin-bottom: 20px; }
.sf-hero__wordmark { width: min(820px, 82vw); margin: 0 auto; }
.sf-hero__wordmark-inner { position: relative; }
.sf-hero__wordmark-inner > img:first-child { display: block; width: 100%; height: auto; }
.sf-hero__snail { position: absolute; left: 83%; bottom: calc(47% + 24px); width: 6%; pointer-events: none; }
.sf-hero__tagline { position: absolute; left: 46%; right: 8%; top: 58%; margin: 0; text-align: center; font: italic clamp(14px, 2.6vw, 22px)/1.4 var(--font-body); color: var(--white); }
.sf-hero__ctas { display: flex; align-items: center; justify-content: center; gap: 26px; margin-top: 26px; flex-wrap: wrap; }
.sf-hero__cta { background: var(--red); color: var(--paper); padding: 13px 26px; font: 700 13px var(--font-body); letter-spacing: .16em; border-radius: 999px; }
.sf-hero__alt { font: italic 15px var(--font-body); color: var(--white); border-bottom: 1px solid var(--white); }
@media (max-width: 900px) { .halo { padding: 60px 24px; } }

/* ---- Marquee ---- */
@keyframes sfMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.sf-marquee { position: relative; overflow: hidden; background: var(--cream); padding: 34px 0 72px; white-space: nowrap; }
.sf-marquee__track { display: inline-flex; align-items: center; font: 700 13px var(--font-body); letter-spacing: .26em; color: var(--green); animation: sfMarquee 28s linear infinite; }
.sf-marquee__unit { display: inline-flex; gap: 38px; align-items: center; padding-right: 38px; }
.sf-marquee__item { display: inline-flex; gap: 38px; align-items: center; }
@media (prefers-reduced-motion: reduce) { .sf-marquee__track { animation: none; } }

/* ---- Blog teaser ---- */
.sf-blog { position: relative; padding: 80px var(--pad-x) 110px; background: var(--white); }
.sf-blog__grid { position: relative; z-index: 3; display: grid; grid-template-columns: 460px 1fr; gap: 40px; align-items: center; }
.sf-blog__tile { position: relative; height: 320px; overflow: hidden; border-radius: 14px; background: var(--cream); }
.sf-blog__tile-art { position: absolute; left: -240px; bottom: -60px; width: 900px; }
.sf-blog__tile-photo { width: 100%; height: 100%; object-fit: cover; display: block; }
.sf-blog__title { font: 34px/1.2 var(--font-display); color: var(--green); margin-bottom: 14px; }
.sf-blog__excerpt { font: 15px/1.75 var(--font-body); color: var(--green); margin: 0 0 18px; }
.sf-blog__cta { font: 700 12px var(--font-body); letter-spacing: .2em; color: var(--paper); background: var(--red); padding: 11px 22px; border-radius: 999px; display: inline-block; }
.sf-blog__more { border-top: 1px solid var(--rule); margin-top: 24px; padding-top: 16px; display: flex; flex-direction: column; gap: 10px; font: italic 15px var(--font-body); }
.sf-blog__empty { font: italic 15px var(--font-body); color: var(--green); }
@media (max-width: 900px) { .sf-blog__grid { grid-template-columns: 1fr; } }

/* ---- Store carousel ---- */
.sf-store { position: relative; padding: 60px 0 116px; background: var(--cream); }
.sf-store__intro { position: relative; z-index: 3; font: italic 14px var(--font-body); color: var(--green); margin: 0 0 22px; }
.sf-carousel { position: relative; z-index: 3; display: flex; gap: 20px; overflow-x: auto; padding: 6px var(--pad-x) 18px; scroll-snap-type: x mandatory; scroll-padding-left: var(--pad-x); scrollbar-color: var(--green) transparent; scrollbar-width: thin; }
.sf-carousel::-webkit-scrollbar { height: 8px; }
.sf-carousel::-webkit-scrollbar-thumb { background: var(--green); border-radius: 4px; }
.sf-card { flex: none; width: 210px; scroll-snap-align: start; background: var(--white); border-radius: 14px; text-align: center; padding: 22px 18px; }
.sf-card__img { height: 120px; width: auto; max-width: 100%; object-fit: contain; display: inline-block; }
.sf-card__title { font: 18px var(--font-display); color: var(--green); margin: 12px 0 4px; display: block; }
.sf-card__price { font: 14px var(--font-body); color: var(--green); margin-bottom: 12px; }
.sf-card__button { font: 700 11px var(--font-body); letter-spacing: .18em; color: var(--paper); background: var(--red); border: 0; border-radius: 999px; padding: 8px 16px; display: inline-block; cursor: pointer; }
.sf-card__button:disabled { background: var(--olive); cursor: default; }
```

- [ ] **Step 4: Rewrite `app/routes/_index.tsx` (hero + marquee only; Task 8 extends it)**

```tsx
// app/routes/_index.tsx
import type {Route} from './+types/_index';
import homeStyles from '~/styles/home.css?url';
import {Hero} from '~/components/home/Hero';
import {Marquee} from '~/components/home/Marquee';
import {SHOP} from '~/config/shop';

export const meta: Route.MetaFunction = () => [
  {title: `${SHOP.name} — ${SHOP.tagline}`},
  {name: 'description', content: 'Art, gardens, and stories for growing families. Hand-painted goods, a blog, and the Bits and Bobs Almanac.'},
];

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: homeStyles}];

export default function Homepage() {
  return (
    <div className="sf-home">
      <Hero />
      <Marquee />
    </div>
  );
}
```

- [ ] **Step 5: Verify**

```bash
npm run typecheck && npm run lint && npm test
(npm run dev > /tmp/sf-dev.log 2>&1 &) ; sleep 25
curl -s http://localhost:3000/ | grep -c 'sf-hero__layer'      # expected: 12
curl -s http://localhost:3000/ | grep -c 'sf-marquee__unit'    # expected: 2 (reps=1 on the server)
curl -s http://localhost:3000/ | grep -o 'rotate(18deg)' | head -1   # expected: rotate(18deg)  (layer A at rest)
pkill -f "shopify hydrogen dev"
```

- [ ] **Step 6: Commit**

```bash
git add app/components/home/Hero.tsx app/components/home/Marquee.tsx app/styles/home.css app/routes/_index.tsx
git commit -m "Port the landing hero (height-based parallax) and seamless marquee to the home route

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Home page — Blog teaser and Store carousel (data-driven)

**Files:**
- Create: `app/components/home/BlogTeaser.tsx`, `app/components/home/StoreCarousel.tsx`, `app/lib/fragments-content.ts`
- Modify: `app/routes/_index.tsx` (loader + two sections)

**Interfaces:**
- Consumes: `AddToCartButton` (skeleton), `useAside`, `Image`/`Money` from `@shopify/hydrogen`, `SHOP`, `ART`, `WaveDivider`.
- Produces: GraphQL fragments `ArticleCard` (exported as `ARTICLE_CARD_FRAGMENT`, reused by Plan 2) and `HomeProductCard`; queries `HomeFeatured`, `HomeArticles`; components `<BlogTeaser articles={Promise<HomeArticlesQuery|null>} />`, `<StoreCarousel featured={Promise<HomeFeaturedQuery|null>} />`. Generated types (`HomeFeaturedQuery`, `HomeArticlesQuery`, `ArticleCardFragment`, `HomeProductCardFragment`) come from `npm run codegen`.

- [ ] **Step 1: Shared article fragment**

```ts
// app/lib/fragments-content.ts
export const ARTICLE_CARD_FRAGMENT = `#graphql
  fragment ArticleCard on Article {
    id
    handle
    title
    excerpt
    publishedAt
    tags
    author: authorV2 { name }
    image { id url altText width height }
  }
` as const;
```

- [ ] **Step 2: Queries and loader in `app/routes/_index.tsx`**

Add these imports at the top of the file:

```tsx
import {ARTICLE_CARD_FRAGMENT} from '~/lib/fragments-content';
import {BlogTeaser} from '~/components/home/BlogTeaser';
import {StoreCarousel} from '~/components/home/StoreCarousel';
```

Add the loader (all home data is below the fold, so everything is deferred and never throws):

```tsx
export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const featured = storefront
    .query(HOME_FEATURED_QUERY, {variables: {handle: SHOP.handles.featuredCollection}, cache: storefront.CacheShort()})
    .catch((error: Error) => { console.error(error); return null; });
  const articles = storefront
    .query(HOME_ARTICLES_QUERY, {variables: {handle: SHOP.handles.blog}, cache: storefront.CacheShort()})
    .catch((error: Error) => { console.error(error); return null; });
  return {featured, articles};
}
```

Replace the component body:

```tsx
export default function Homepage() {
  const {featured, articles} = useLoaderData<typeof loader>();
  return (
    <div className="sf-home">
      <Hero />
      <Marquee />
      <BlogTeaser articles={articles} />
      <StoreCarousel featured={featured} />
    </div>
  );
}
```

(add `useLoaderData` to the `react-router` import: `import {useLoaderData} from 'react-router';`)

Append the queries at the bottom of the file:

```tsx
const HOME_PRODUCT_CARD_FRAGMENT = `#graphql
  fragment HomeProductCard on Product {
    id
    handle
    title
    availableForSale
    featuredImage { id url altText width height }
    priceRange { minVariantPrice { amount currencyCode } }
    variants(first: 2) {
      nodes {
        id
        title
        availableForSale
        price { amount currencyCode }
        image { id url altText width height }
        selectedOptions { name value }
        product { handle title }
      }
    }
  }
` as const;

const HOME_FEATURED_QUERY = `#graphql
  ${HOME_PRODUCT_CARD_FRAGMENT}
  query HomeFeatured($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      products(first: 8) { nodes { ...HomeProductCard } }
    }
    fallback: collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        handle
        title
        products(first: 8) { nodes { ...HomeProductCard } }
      }
    }
  }
` as const;

const HOME_ARTICLES_QUERY = `#graphql
  ${ARTICLE_CARD_FRAGMENT}
  query HomeArticles($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    blog(handle: $handle) {
      id
      handle
      articles(first: 3, sortKey: PUBLISHED_AT, reverse: true) { nodes { ...ArticleCard } }
    }
  }
` as const;
```

- [ ] **Step 3: Generate types, then write `BlogTeaser`**

Run `npm run codegen` (creates `HomeFeaturedQuery`, `HomeArticlesQuery`, `ArticleCardFragment`, `HomeProductCardFragment` in `storefrontapi.generated.d.ts`).

```tsx
// app/components/home/BlogTeaser.tsx
import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {HomeArticlesQuery, ArticleCardFragment} from 'storefrontapi.generated';
import {WaveDivider} from '~/components/WaveDivider';
import {ART, BLOGS, SHOP} from '~/config/shop';

const BLOG = BLOGS[SHOP.handles.blog];

export function articleUrl(article: Pick<ArticleCardFragment, 'handle'>) {
  return `${BLOG.path}/${article.handle}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).toUpperCase();
}

export function BlogTeaser({articles}: {articles: Promise<HomeArticlesQuery | null>}) {
  return (
    <section id="blog" className="sf-blog pad">
      <img className="sf-art" src={ART.tomato} alt="" style={{right: -190, bottom: -40, width: 330, transform: 'rotate(12deg)'}} />
      <img className="sf-art" src={ART.blogArtLeft} alt="" style={{left: -320, bottom: -60, width: 570, transform: 'rotate(-18deg)'}} />
      <WaveDivider variant="blog" fill="white" />
      <div className="sf-section-head">
        <span className="sf-section-title">{BLOG.title}</span>
        <Link to={BLOG.path} className="sf-italic-link">All posts</Link>
      </div>
      <Suspense fallback={<TeaserBody articles={[]} loading />}>
        <Await resolve={articles}>
          {(data) => <TeaserBody articles={data?.blog?.articles.nodes ?? []} />}
        </Await>
      </Suspense>
    </section>
  );
}

function TeaserBody({articles, loading = false}: {articles: ArticleCardFragment[]; loading?: boolean}) {
  const [featured, ...rest] = articles;
  return (
    <div className="sf-blog__grid">
      <div className="sf-blog__tile">
        {featured?.image ? (
          <Image data={featured.image} sizes="(min-width: 900px) 460px, 100vw" className="sf-blog__tile-photo" alt={featured.image.altText || featured.title} />
        ) : (
          <img src={ART.blogTile} alt="" className="sf-blog__tile-art" />
        )}
      </div>
      <div>
        {featured ? (
          <>
            <div className="sf-eyebrow" style={{marginBottom: 12}}>Latest · {formatDate(featured.publishedAt)}</div>
            <div className="sf-blog__title">{featured.title}</div>
            {featured.excerpt ? <p className="sf-blog__excerpt">{featured.excerpt}</p> : null}
            <Link to={articleUrl(featured)} className="sf-blog__cta">READ THE POST →</Link>
            {rest.length ? (
              <div className="sf-blog__more">
                {rest.slice(0, 2).map((a) => <Link key={a.id} to={articleUrl(a)}>{a.title}</Link>)}
              </div>
            ) : null}
          </>
        ) : (
          <p className="sf-blog__empty">{loading ? 'Loading the latest…' : 'Nothing planted here yet.'}</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `StoreCarousel`**

```tsx
// app/components/home/StoreCarousel.tsx
import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {HomeFeaturedQuery, HomeProductCardFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {WaveDivider} from '~/components/WaveDivider';
import {ART} from '~/config/shop';

export function StoreCarousel({featured}: {featured: Promise<HomeFeaturedQuery | null>}) {
  return (
    <section id="store" className="sf-store">
      <img className="sf-art" src={ART.eggplant} alt="" style={{right: -130, top: -20, width: 240, transform: 'rotate(20deg)'}} />
      <WaveDivider variant="store" fill="cream" />
      <div className="sf-section-head pad" style={{margin: '0 0 24px'}}>
        <span className="sf-section-title">The Store</span>
        <Link to="/collections/all" className="sf-italic-link">Browse everything</Link>
      </div>
      <p className="sf-store__intro pad">Hand-painted goods, crated up and shipped with care · scroll →</p>
      <Suspense fallback={<div className="sf-carousel" aria-busy="true" />}>
        <Await resolve={featured}>
          {(data) => {
            const collection = data?.collection ?? data?.fallback?.nodes?.[0] ?? null;
            const products = collection?.products.nodes ?? [];
            return (
              <div id="carousel" className="sf-carousel" role="list" aria-label="Featured products">
                {products.length === 0 ? (
                  <p className="sf-blog__empty pad">Nothing on the shelves yet.</p>
                ) : (
                  products.map((p) => <ProductCard key={p.id} product={p} />)
                )}
              </div>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

export function ProductCard({product}: {product: HomeProductCardFragment}) {
  const {open} = useAside();
  const variants = product.variants.nodes;
  const single = variants.length === 1 ? variants[0] : null;
  const soldOut = !product.availableForSale;
  const url = `/products/${product.handle}`;

  return (
    <article className="sf-card" role="listitem">
      <Link to={url} prefetch="intent">
        {product.featuredImage ? (
          <Image data={product.featuredImage} sizes="210px" className="sf-card__img" alt={product.featuredImage.altText || product.title} />
        ) : null}
        <span className="sf-card__title">{product.title}</span>
      </Link>
      <div className="sf-card__price">
        <Money data={product.priceRange.minVariantPrice} withoutTrailingZeros />
      </div>
      {soldOut ? (
        <button className="sf-card__button" type="button" disabled>SOLD OUT</button>
      ) : single ? (
        <AddToCartButton
          lines={[{merchandiseId: single.id, quantity: 1, selectedVariant: single}]}
          onClick={() => open('cart')}
          analytics={{products: [{productGid: product.id, variantGid: single.id, name: product.title, price: single.price.amount, quantity: 1}]}}
        >
          ADD TO CART
        </AddToCartButton>
      ) : (
        <Link to={url} className="sf-card__button">ADD TO CART</Link>
      )}
    </article>
  );
}
```

The skeleton's `AddToCartButton` renders a bare `<button>`; give it the card styling by adding `className="sf-card__button"` to that `<button>` in `app/components/AddToCartButton.tsx` (the class is harmless on the product page, which Plan 2 restyles anyway).

- [ ] **Step 5: Verify (mock.shop: `frontpage` is absent, so the fallback collection feeds the carousel; the blog is null, so the teaser shows its empty state)**

```bash
npm run codegen && npm run typecheck && npm run lint && npm test
(npm run dev > /tmp/sf-dev.log 2>&1 &) ; sleep 30
curl -s http://localhost:3000/ | grep -c 'sf-card__title'          # expected: ≥1 (streamed in the same response)
curl -s http://localhost:3000/ | grep -c 'Nothing planted here yet' # expected: 1
curl -s http://localhost:3000/ | grep -c 'scroll-padding-left' ; grep -c 'scroll-padding-left' app/styles/home.css   # expected: 0 then 1 (it lives in CSS)
pkill -f "shopify hydrogen dev"
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add data-driven blog teaser and store carousel with quick add to the home page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Playwright e2e for the home page and cart (mock.shop)

**Files:**
- Create: `playwright.config.ts`, `e2e/home.spec.ts`, `e2e/cart.spec.ts`

**Interfaces:**
- Consumes: running dev server on http://localhost:3000 (Playwright starts it).
- Produces: `npm run test:e2e` green.

- [ ] **Step 1: Config**

```ts
// playwright.config.ts
import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {baseURL: 'http://localhost:3000', trace: 'retain-on-failure'},
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {name: 'desktop', use: {...devices['Desktop Chrome'], viewport: {width: 1280, height: 900}}},
    {name: 'mobile', use: {...devices['Desktop Chrome'], viewport: {width: 375, height: 812}, isMobile: true, hasTouch: true, deviceScaleFactor: 2}},
  ],
});
```

- [ ] **Step 2: Home spec**

```ts
// e2e/home.spec.ts
import {expect, test} from '@playwright/test';

test.describe('home', () => {
  test('renders hero, marquee, teaser, carousel, footer inside the frame', async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('.sf-frame')).toBeVisible();
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('.sf-hero__layer')).toHaveCount(12);
    await expect(page.locator('#store')).toBeVisible();
    await expect(page.locator('.sf-footgrid')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('marquee is seamless: rendered sequence is at least viewport width', async ({page}) => {
    await page.goto('/');
    await page.waitForFunction(() => document.querySelectorAll('.sf-marquee__unit').length >= 2);
    const {trackWidth, viewport, units} = await page.evaluate(() => ({
      trackWidth: document.querySelector('.sf-marquee__track')!.getBoundingClientRect().width,
      viewport: window.innerWidth,
      units: document.querySelectorAll('.sf-marquee__unit').length,
    }));
    expect(units % 2).toBe(0);
    expect(trackWidth / 2).toBeGreaterThanOrEqual(viewport);
  });

  test('has no horizontal overflow and the footer stacks correctly', async ({page}, testInfo) => {
    await page.goto('/');
    await page.waitForSelector('.sf-card, .sf-blog__empty');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBe(0);
    const columns = await page.evaluate(() => getComputedStyle(document.querySelector('.sf-footgrid')!).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(testInfo.project.name === 'mobile' ? 1 : 4);
  });

  test('carousel first card aligns with the section title', async ({page}) => {
    await page.goto('/');
    const card = page.locator('#carousel .sf-card').first();
    await expect(card).toBeVisible();
    const cardLeft = (await card.boundingBox())!.x;
    const titleLeft = (await page.locator('#store .sf-section-title').boundingBox())!.x;
    expect(Math.abs(cardLeft - titleLeft)).toBeLessThanOrEqual(2);
    expect(await page.locator('#carousel').evaluate((el) => el.scrollLeft)).toBe(0);
  });

  test('parallax progress is continuous through 520px', async ({page}, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'desktop only');
    await page.goto('/');
    const at = async (y: number) => {
      await page.evaluate((y) => { window.scrollTo(0, y); window.dispatchEvent(new Event('scroll')); }, y);
      await page.waitForTimeout(50);
      return page.locator('.sf-hero__layer').first().evaluate((el) => el.style.transform);
    };
    const t0 = await at(0), t519 = await at(519), t521 = await at(521);
    expect(t0).toBe('translate(0px, 0px) rotate(18deg)');
    expect(t519).not.toBe(t521);
  });

  test('mobile: burger opens the menu with the nav links', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile only');
    await page.goto('/');
    await expect(page.locator('.sf-nav__links')).toBeHidden();
    await page.getByRole('button', {name: 'Menu'}).click();
    const dialog = page.getByRole('dialog', {name: 'Menu'});
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('link', {name: 'Bits and Bobs Almanac'})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
```

- [ ] **Step 3: Cart spec**

```ts
// e2e/cart.spec.ts
import {expect, test} from '@playwright/test';

test('add a product from the carousel (or its PDP) and see it in the drawer with a checkout link', async ({page}) => {
  await page.goto('/');
  const card = page.locator('#carousel .sf-card').first();
  await expect(card).toBeVisible();
  const quickAdd = card.locator('button.sf-card__button:not([disabled])');
  if (await quickAdd.count()) {
    await quickAdd.click();
  } else {
    await card.locator('a.sf-card__button').click();
    await page.getByRole('button', {name: /add to cart/i}).click();
  }
  const drawer = page.getByRole('dialog', {name: 'Your basket'});
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('.cart-line')).toHaveCount(1, {timeout: 15_000});
  await expect(drawer.getByRole('link', {name: /checkout/i})).toHaveAttribute('href', /checkout|mock\.shop/);
  await expect(page.locator('.sf-nav__count').first()).toHaveText('1');
});
```

- [ ] **Step 4: Run**

Run: `npm run test:e2e`
Expected: all tests pass in both projects (the mobile-only / desktop-only tests are skipped in the other project). If `carousel first card aligns` fails only on `mobile`, confirm `--pad-x` is 24px at ≤900px and `scroll-padding-left: var(--pad-x)` is present on `.sf-carousel`.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e
git commit -m "Add Playwright e2e for home layout, marquee, parallax, mobile menu, and cart

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Production build check, owner docs, and seed products

**Files:**
- Create: `docs/store-setup.md`, `docs/products-placeholder.csv`, `.env.example`
- Modify: `README.md` (replace the skeleton intro)

**Interfaces:**
- Produces: `npm run build` green; a checklist the store owner follows before Plan 2's content routes can be verified.

- [ ] **Step 1: Build and preview**

```bash
npm run build                      # expected: exit 0, "build complete"
(npm run preview > /tmp/sf-preview.log 2>&1 &) ; sleep 20
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/    # expected: 200
pkill -f "shopify hydrogen preview"
```

- [ ] **Step 2: `.env.example`**

```dotenv
# Copy to .env. `npx shopify hydrogen env pull` fills the PUBLIC_* values after `hydrogen link`.
SESSION_SECRET="change-me"
PUBLIC_STORE_DOMAIN="your-store.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN=""
PUBLIC_STOREFRONT_ID=""
PUBLIC_CHECKOUT_DOMAIN=""
# Admin API token of the "Storefront newsletter" custom app (read_customers, write_customers). Server-only.
PRIVATE_ADMIN_API_ACCESS_TOKEN=""
```

- [ ] **Step 3: `docs/store-setup.md`**

````markdown
# Store setup checklist (owner)

The storefront runs against `mock.shop` until a store is linked. Blog, Almanac, About, and the newsletter need a real store.

1. **Create a development store** at https://dev.shopify.com (Dev Dashboard → Stores → Create dev store).
2. **Blogs** (Content → Blog posts → Manage blogs): create *The Blog* with handle `blog` and *Bits and Bobs Almanac* with handle `bits-and-bobs-almanac`. Publish at least one post in each with a featured image.
3. **About page** (Content → Pages): create *About* with handle `about`.
4. **Featured collection**: the default *Home page* collection has handle `frontpage`. Add the products you want in the home carousel.
5. **Products**: Products → Import → `docs/products-placeholder.csv` (7 placeholders; add images afterwards).
6. **Newsletter app**: Settings → Apps and sales channels → Develop apps → Create app *Storefront newsletter* → Configure Admin API scopes `read_customers`, `write_customers` → Install → copy the **Admin API access token** into `PRIVATE_ADMIN_API_ACCESS_TOKEN` (local `.env`; Oxygen → Storefront settings → Environment variables, mark as secret).
7. **Hydrogen channel**: Sales channels → add *Hydrogen* → Create storefront. Then locally:
   ```bash
   npx shopify hydrogen link
   npx shopify hydrogen env pull
   npm run dev
   ```
8. Verify: `/` shows your products and latest post; `/blog`, `/bits-and-bobs-almanac`, `/about` render (Plan 2); footer signup shows "You're in 🌱" and the customer appears under Customers with *Subscribed* email marketing.
````

- [ ] **Step 4: `docs/products-placeholder.csv`**

```csv
Handle,Title,Body (HTML),Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant Price,Variant Requires Shipping,Variant Taxable,Variant Inventory Policy,Variant Fulfillment Service,Status
radish-patch-print,Radish Patch Print,"<p>A hand-painted radish patch, printed on heavy matte stock.</p>",SallyForth,Print,"print,garden",TRUE,Title,Default Title,24.00,TRUE,TRUE,deny,manual,active
sweet-pea-kit,Sweet Pea Kit,"<p>Everything a small gardener needs to grow sweet peas.</p>",SallyForth,Kit,"kit,garden",TRUE,Title,Default Title,32.00,TRUE,TRUE,deny,manual,active
tomato-tea-towel,Tomato Tea Towel,"<p>A tomato-print tea towel for the kitchen table.</p>",SallyForth,Textile,"kitchen,tomato",TRUE,Title,Default Title,18.00,TRUE,TRUE,deny,manual,active
beet-bandana,Beet Bandana,"<p>A beet-print cotton bandana.</p>",SallyForth,Textile,"beet",TRUE,Title,Default Title,22.00,TRUE,TRUE,deny,manual,active
eggplant-patch,Eggplant Patch,"<p>An embroidered eggplant patch.</p>",SallyForth,Patch,"patch",TRUE,Title,Default Title,12.00,TRUE,TRUE,deny,manual,active
blueberry-sticker-set,Blueberry Sticker Set,"<p>A set of blueberry stickers.</p>",SallyForth,Stickers,"stickers",TRUE,Title,Default Title,8.00,TRUE,TRUE,deny,manual,active
carrot-grow-kit,Carrot Grow Kit,"<p>Grow your own carrots, from seed to table.</p>",SallyForth,Kit,"kit,carrot",TRUE,Title,Default Title,28.00,TRUE,TRUE,deny,manual,active
```

- [ ] **Step 5: README**

Replace `README.md` with:

````markdown
# SallyForth storefront

Shopify Hydrogen storefront (React Router 7, TypeScript, plain CSS) for SallyForth — art, gardens, and stories for growing families. Deploys to Oxygen.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000 (mock.shop until a store is linked)
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
````

- [ ] **Step 6: Final verification and commit**

```bash
npm run typecheck && npm run lint && npm test && npm run test:e2e
git add -A
git commit -m "Add build check, store setup checklist, placeholder products CSV, README

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-review notes (already applied)

- **Spec coverage for Plan 1's scope:** §3 (stack, layout, assets, tokens, data, rendering) → Tasks 1–4, 8; §6 → Task 6; §7 → Tasks 7–8; §11 → Task 5; §14 → Tasks 6–7 (skip link, focus trap, reduced motion, aria); §15 (unit + mock.shop e2e) → Tasks 4, 5, 9; §17 → Tasks 1–2, 10. Deferred to Plan 2: §4 routes beyond home, §8 shop restyle, §9 content pages, §10 search restyle, §12 branded 404/error boundary, `/blogs` and `/pages/about` redirects. Deferred to Plan 3: §13 SEO/sitemap/JSON-LD, §16 Oxygen deployment.
- **Type consistency:** `computeMarqueeReps(viewportWidth, unitWidth)`, `heroProgress(scrollY, heroBottomAbs)`, `layerTransform(kind, p)`, `subscribe(email, adminFetch)`, `createAdminFetch(env)`, `SubscribeResult`, `ARTICLE_CARD_FRAGMENT`, `HomeFeaturedQuery`/`HomeArticlesQuery`, `<PageLayout cart publicStoreDomain>`, `<Header cart>` are used with the same names and shapes in every task that references them.
