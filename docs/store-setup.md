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
