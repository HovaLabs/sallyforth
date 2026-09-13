# SallyForth Hydrogen Storefront — Design

**Date:** 2026-09-13
**Status:** Draft for review
**Scope:** Convert the SallyForth landing page (`index.html`, "Landing Page 6a") into a full Shopify storefront built with Hydrogen and hosted on Oxygen.

## 1. Summary

Build a Hydrogen (React Router 7) storefront in this repository whose home page is a faithful port of the current landing page, plus:

- **Shop:** collections, product pages, cart drawer, Shopify checkout
- **Content:** The Blog (`/blog`), Bits and Bobs Almanac (`/bits-and-bobs-almanac`), About (`/about`) — all authored in Shopify admin
- **Site search** over products, articles, and pages
- **Newsletter signup** that subscribes the email to Shopify with marketing consent

Deployed to Oxygen via the Hydrogen sales channel's GitHub integration.

### Goals
- Everything editable in Shopify admin; the storefront renders, it does not author.
- Least custom code: keep the Hydrogen skeleton's proven shop/cart/search routes; restyle them.
- Preserve the landing page's look and motion, and the behavioral fixes it accumulated.

### Non-goals (v1)
- Customer accounts / login / order history
- Season filter on the Almanac
- Palmore font (dropped; Libre Caslon Text is what renders today)
- Multi-currency / markets (single market, USD)
- Reviews, wishlists, headless CMS

## 2. Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Shopify store | Does not exist yet → create a free **development store** now; re-point env vars later if a separate live store is created |
| Content source | Shopify-native: two blogs + one page (Approach A) |
| Code location | This repo, at root; landing `index.html` kept as `legacy/landing-page.html` |
| Home page | Faithful port of the 6a landing page |
| Products | Placeholders; build generically against collections; seed the 7 landing-page products for demos |
| Newsletter | Shopify-native via Admin API from a server action |
| Extras | Site search yes; customer accounts no |
| Long-form body text | **17px / 1.75** for all Shopify rich text (articles, About, product descriptions) |
| Content URLs | Top-level `/blog`, `/bits-and-bobs-almanac`, `/about` (no `/blogs/` or `/pages/` prefix) |

## 3. Architecture

### Stack
- `@shopify/hydrogen` (latest), React Router 7 framework mode, TypeScript, Vite
- Plain CSS with custom properties; no Tailwind. The design is already bespoke CSS; tokens live in `app/styles/tokens.css`.
- Node 20+, npm

### Repository layout
```
app/
  components/          shared UI (Frame, Header, MobileMenu, Footer, WaveDivider, ProductCard, ArticleCard, …)
  components/home/     Hero, Marquee, BlogTeaser, StoreCarousel
  lib/content/         blog config, fragments, loader factories, BlogIndexPage, ArticlePage
  lib/newsletter/      Admin API client + subscribe logic
  routes/              flat routes (see §4)
  styles/              tokens.css, base.css, prose.css, per-component css
  config/shop.ts       handles, nav, blog config
public/art/            extracted images (webp/svg)
public/fonts/          extracted woff2 (Abril Fatface, Libre Caslon Text)
legacy/landing-page.html   the bundled landing page, reference only
scripts/extract-legacy-assets.mjs   one-time asset extraction (kept for provenance)
docs/superpowers/      specs and plans
```

### Assets
The 25 images/fonts base64-bundled in the landing page are extracted once into real files. Names come from the bundle's `ext_resources` ids where present (`tomato`, `carrot`, `peapod`, `beet`, `eggplant`, `blueberries`, `radish2`, `radish-a/b/c`, `snail`, `beet-big`, `carrot-big`) and by role otherwise (`wordmark-script.webp`, `wordmark-footer.webp`, `leaf-*.webp`, …). Fonts are self-hosted from the bundle's woff2 files with `font-display: swap`.

### Design tokens
```
--green: rgb(36,88,42)   --red: #B30C00   --rust: #C1440E   --olive: #43573A
--cream: #FAF9F8         --paper: #FFFBEA --white: #FFFFFF  --rule: #7A96C3
--font-display: 'Abril Fatface', serif
--font-body: 'Libre Caslon Text', serif
```

### Data
- **Storefront API** for everything the site reads (products, collections, cart, blogs, articles, pages, search).
- **Admin API** in exactly one place: the newsletter action (§11), using a private token that never reaches the browser.

### Rendering
SSR on Oxygen. Hydrogen's critical-vs-deferred loader pattern: above-the-fold data blocks the response; below-the-fold data (carousel products, latest posts, related posts) streams in behind Suspense skeleton placeholders.

## 4. Routes and URL scheme

Flat routes in `app/routes/`. Skeleton routes kept unless noted.

| URL | Route file | Source | Notes |
|---|---|---|---|
| `/` | `_index.tsx` | collection `frontpage`, blog `blog` | Home port (§7) |
| `/collections` | `collections._index.tsx` | Storefront | restyled |
| `/collections/all` | `collections.all.tsx` | Storefront | nav "Shop" target |
| `/collections/:handle` | `collections.$handle.tsx` | Storefront | restyled; filters/sort kept |
| `/products/:handle` | `products.$handle.tsx` | Storefront | PDP (§8) |
| `/cart` | `cart.tsx`, `cart.$lines.tsx` | Cart API | skeleton; drawer opens from header |
| `/blog` | `blog._index.tsx` | blog `blog` | thin file → `makeBlogIndexLoader('blog')` |
| `/blog/:article` | `blog.$articleHandle.tsx` | blog `blog` | thin file → `makeArticleLoader('blog')` |
| `/bits-and-bobs-almanac` | `bits-and-bobs-almanac._index.tsx` | blog `bits-and-bobs-almanac` | same factories |
| `/bits-and-bobs-almanac/:article` | `bits-and-bobs-almanac.$articleHandle.tsx` | | |
| `/blogs/:blog[/:article]` | `blogs.$blogHandle._index.tsx`, `blogs.$blogHandle.$articleHandle.tsx` | — | **301** to the short URL for the two known handles; 404 otherwise |
| `/about` | `about.tsx` | page `about` | thin file → shared page renderer |
| `/pages/:handle` | `pages.$handle.tsx` | Storefront | any other Shopify page; `/pages/about` 301s to `/about` |
| `/search?q=` | `search.tsx` | Storefront `search` | products + articles + pages; predictive search served from the same route |
| `/newsletter` | `newsletter.tsx` | Admin API | POST-only resource route (§11) |
| `/policies`, `/policies/:handle` | skeleton | | restyled |
| `/sitemap.xml`, `/sitemap/:type/:page.xml`, `/robots.txt` | skeleton | | article entries mapped to short URLs |
| `/discount/:code` | skeleton | | kept (marketing links) |
| `*` | `$.tsx` | | branded 404 |
| `account*` | — | | **removed** |

**Nav** is a fixed config in `app/config/shop.ts`: Shop → `/collections/all`, About → `/about`, Blog → `/blog`, Bits and Bobs Almanac → `/bits-and-bobs-almanac`, Cart → opens drawer, plus a search icon (§10). Handles (`frontpage`, `blog`, `bits-and-bobs-almanac`, `about`) live in the same file.

Article URLs in search results, sitemaps, and internal links always use the short form; the `/blogs/...` redirects exist only for links Shopify generates elsewhere.

## 5. Shopify store setup (owner tasks)

1. Create a **development store** (Shopify Dev Dashboard / Partners).
2. **Blogs:** create "The Blog" (handle `blog`) and "Bits and Bobs Almanac" (handle `bits-and-bobs-almanac`); publish at least one post in each.
3. **Page:** create "About" (handle `about`).
4. **Collection:** the default "Home page" collection has handle `frontpage`; add featured products to it.
5. **Products:** import the 7 placeholder products (a CSV will be provided): Radish Patch Print, Sweet Pea Kit, Tomato Tea Towel, Beet Bandana, Eggplant Patch, Blueberry Sticker Set, Carrot Grow Kit.
6. **Custom app** for the newsletter: Settings → Apps and sales channels → Develop apps → create "Storefront newsletter" with Admin scopes `read_customers`, `write_customers` → install → copy the Admin API access token.
7. **Hydrogen channel:** install the Hydrogen sales channel, create a storefront, then locally `npx shopify hydrogen link` and `npx shopify hydrogen env pull`.

Until step 1 is done, product/cart work proceeds against `mock.shop`; content and newsletter routes need the real store.

## 6. Shared layout

- **Frame:** the landing page's triple green border (10px page padding → 3px border → 1px border, `overflow-x: hidden`) wraps every page so the whole site reads as one object.
- **Header:** sticky, translucent white with blur, tomato logo left, pill nav right (Shop red, About rust, Blog green, Almanac olive), cart icon with live count, search icon. ≤760px: nav collapses to the burger.
- **MobileMenu:** full-screen overlay with the rotated leaf art, stacked pills, Search link, close button; traps focus, closes on Esc / link / backdrop.
- **Cart drawer:** Hydrogen aside; line items, quantities, subtotal, "Checkout" → `cart.checkoutUrl`.
- **Footer:** `footgrid` (2fr 1fr 1fr 1fr → 1fr 1fr at ≤900px with the newsletter column spanning both → **1fr, centered, at ≤600px**), newsletter form (§11), copyright row, footer wordmark with the snail.
- **WaveDivider:** the three SVG wave paths as one component with a `fill` prop.

## 7. Home page (faithful port)

Components in `app/components/home/`:

- **Hero:** full-viewport green stage (`calc(100vh - 80px)`, min 560px) with the positioned leaf/vegetable art, script wordmark, snail, "Into the garden of creativity", eyebrow `ART · GARDENS · STORIES`, `SHOP THE STORE` pill and "or start with the blog" link. **Parallax:** progress `p` is derived from the hero's own height (`end = hero.bottom + scrollY; p = clamp(scrollY / end); p = 1 − (1−p)²`), never a hardcoded scroll distance; each art layer keeps its landing-page transform recipe. Off when `prefers-reduced-motion`.
- **Marquee:** GROW/MAKE/TELL strip with the vegetable icons. **Seamless:** measure one unit, repeat it until a sequence is at least viewport width plus one, render the sequence twice, animate `translateX(-50%)`, rebuild on resize (debounced) and after fonts load. Static under `prefers-reduced-motion`. Decorative: `aria-hidden` with a visually-hidden text equivalent.
- **BlogTeaser:** data-driven — featured = newest article in `blog` (art tile left; date eyebrow, title, excerpt, `READ THE POST →` pill right); the two secondary links = the next two newest articles. "All posts" → `/blog`.
- **StoreCarousel:** products from `frontpage` (first 8). Horizontal scroll-snap with **`scroll-padding-left` matching the section padding (64px / 24px ≤900px)** so the first card aligns with the title. Card: image, title (Abril Fatface 18px), price, `ADD TO CART` pill. Single-variant available product → adds to cart in place and opens the drawer; multi-variant → goes to the PDP; sold out → disabled `SOLD OUT`. "Browse everything" → `/collections/all`.
- Section headers, wave dividers, and the off-edge `.art` decorations (hidden ≤900px) match the landing page.

Home loader: nothing critical beyond layout; carousel products and articles are deferred.

## 8. Shop pages

- **Collection pages:** skeleton grid restyled with the carousel card; `Pagination` load-more pill; sort kept; filters kept where the collection provides them.
- **Product page:** gallery (main image + thumbnails), title, price / compare-at, variant selector (Hydrogen `VariantSelector`), quantity, add-to-cart via `CartForm`, description rendered through `prose.css` (17px), "You may also like" from the same collection (deferred). Rounded cream tiles and green/red pills throughout.
- **Cart:** drawer plus `/cart` page; empty state in brand voice ("Your basket is empty — the garden's this way →").
- **Checkout:** Shopify checkout via `cart.checkoutUrl`; no custom checkout.

## 9. Content pages

Both blogs share one implementation, configured per blog in `app/config/shop.ts`:

```
blogs: {
  blog:                    { path: '/blog', title: 'The Blog', tagline: 'Stories, crafts, and garden notes from the SallyForth table.', art: ['tomato','carrot'] },
  'bits-and-bobs-almanac': { path: '/bits-and-bobs-almanac', title: 'Bits and Bobs Almanac', tagline: 'Small seasonal things worth knowing: bits, bobs, and what to plant next.', art: ['snail','radish-a'] },
}
```

### Index page (`/blog`, `/bits-and-bobs-almanac`)
- Framed page, sticky header, wave divider, off-edge art (hidden ≤900px).
- Header in the landing's section style: eyebrow (`THE BLOG` / `BITS AND BOBS ALMANAC`), Abril Fatface title, italic tagline from config (Shopify blogs have no description field; the taglines above are draft copy).
- **Featured post** = newest article, laid out like the home BlogTeaser.
- **Post grid** for the rest: 3 columns → 2 → 1. Card = image (rounded 14px), date eyebrow, title, excerpt, tag chips.
- `Pagination` load-more, 12 per page. Sort: newest first.
- Empty state: "Nothing planted here yet."

### Article page (`/blog/:article`, `/bits-and-bobs-almanac/:article`)
- Header: eyebrow `THE BLOG · SEPTEMBER 2, 2026 · BY AUTHOR`, large Abril Fatface title, optional italic excerpt, article image in the rounded tile.
- Body: `contentHtml` through `prose.css` — **Libre Caslon 17px / 1.75 on a ~700px measure**, green links, cream blockquotes, rounded images, italic captions, sensible heading scale.
- Tag chips; **"More from {blog title}"** — the 3 most recent other posts in the same blog (deferred).
- Wrong blog for an article handle → 404 (an article is only served under its own blog's path).

### About (`/about`)
Shopify page `about`: Abril Fatface title, body through `prose.css` (17px), same frame and art treatment. `pages.$handle` renders any other page the same way.

### Shared data
- `ArticleCard` fragment: `id handle title excerpt publishedAt tags author{name} image{url altText width height}` — used by home, index, related posts, search.
- `ArticleFull` = `ArticleCard` + `contentHtml seo{title description}`.

## 10. Search

Skeleton `/search` restyled: products (card grid), articles (article cards linking to short URLs), pages. Predictive search in the header (desktop: icon expands an input; mobile: "Search" in the menu). Results pages are `noindex`.

## 11. Newsletter

- **UI:** footer form (`email` input, `SIGN UP` pill) submitted with `useFetcher` to `POST /newsletter`; works without JS. States: idle → submitting → "You're in 🌱" or an inline error. Hidden honeypot field; a filled honeypot returns `{ok:true}` silently.
- **Action:** validate email (format, length); call **Admin GraphQL** `customerCreate` with `email`, `tags: ["newsletter"]`, `emailMarketingConsent: { marketingState: SUBSCRIBED, marketingOptInLevel: SINGLE_OPT_IN }`. If `userErrors` says the email is taken → `customers(first: 1, query: "email:<email>")` → `customerEmailMarketingConsentUpdate`. Returns `{ok:true}` or `{error:'…'}` with a friendly message; logs details server-side.
- **Config:** `PRIVATE_ADMIN_API_ACCESS_TOKEN` and `PUBLIC_STORE_DOMAIN` from env; Admin API version pinned in `app/lib/newsletter/admin.ts`. Missing token → action returns a generic error and logs a clear message; the site otherwise works.
- Double opt-in remains a Shopify Email setting.

## 12. Errors and empty states

- Missing collection / product / article / page → `throw new Response(null, {status: 404})` → branded 404 (frame, art, "This bed's empty" copy, links home/shop/blog).
- Storefront API failure → route `ErrorBoundary` with the frame and a plain message; Suspense fallbacks are skeleton tiles in cream.
- Newsletter failures are inline; never a page error.
- The `/blogs/...` redirects and `/pages/about` return 301s.

## 13. SEO and analytics

- Per-route `meta`: title, description, canonical (short URLs), Open Graph image (product/article image, wordmark fallback).
- JSON-LD: `Product` on PDPs, `BlogPosting` on articles, `Organization` on home.
- Sitemap: skeleton generator with article links mapped to `/blog/:handle` / `/bits-and-bobs-almanac/:handle`.
- Hydrogen `Analytics.Provider` + Shopify customer privacy consent banner (skeleton default).

## 14. Accessibility and motion

- Landmarks (`header`, `nav`, `main`, `footer`), skip link, visible green focus rings, alt text from Shopify, buttons vs links used correctly.
- Mobile menu: focus trap, Esc closes, `aria-expanded` on the burger.
- Carousel scrolls with keyboard/trackpad; no JS-only controls required.
- `prefers-reduced-motion`: parallax off, marquee static, transitions minimal.
- Text contrast: white on `--green` and cream on `--red` pass AA at the sizes used.

## 15. Testing

- **Vitest** (pure logic): marquee repetition math, parallax easing/clamping, newsletter validation and Admin API response handling (mocked `fetch`), blog config → URL mapping, `/blogs` redirect resolution.
- **Playwright** e2e against `npm run dev`:
  - mock.shop suite (always runs): home renders hero/marquee/carousel; carousel card → PDP → add to cart → drawer shows the line → checkout link present; 375×812 has zero horizontal overflow; footer is one column at 375 and 600; no loading splash.
  - dev-store suite (skipped unless `E2E_STORE=1`): `/blog` and `/bits-and-bobs-almanac` list posts and open an article; `/about` renders; `/blogs/blog/<x>` 301s; search returns products and articles; newsletter subscribes a test address.
- Manual: Lighthouse pass on home, PDP, and an article before launch.

## 16. Environments and deployment

- **Local:** `npm run dev` (uses `.env` from `shopify hydrogen env pull`, or mock.shop when unlinked).
- **Oxygen:** connect the GitHub repo in the Hydrogen channel → preview deployment per branch/PR, production from `main`.
- **Env vars:** `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN`, `PUBLIC_STOREFRONT_ID`, `SESSION_SECRET` (managed by the channel) and `PRIVATE_ADMIN_API_ACCESS_TOKEN` (added manually as a secret). `.env` is gitignored.
- Custom domain attached in the Hydrogen channel when ready.

## 17. Migration of this repository

1. Commit and PR the completed 6a landing-page swap on the current branch first.
2. New branch for the storefront.
3. `git mv index.html legacy/landing-page.html`; delete the stray `package-lock.json`.
4. Scaffold the Hydrogen skeleton (TypeScript, plain CSS, no i18n) into a temp directory and move it to the repo root, since the CLI refuses non-empty targets.
5. Run the asset extraction script; commit the extracted files.
6. Build in the order set by the implementation plan: tokens/frame/header/footer → home → shop → content → search → newsletter → SEO/tests → deploy.

## 18. Assumptions

- Single market, USD, English.
- Prices display as the Storefront API returns them (no custom formatting beyond `Money`).
- The 7 placeholder products are physical goods; shipping is configured in Shopify, not the storefront.
