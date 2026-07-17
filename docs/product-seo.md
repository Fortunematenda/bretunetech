# Product SEO Operations

## Data ownership

Scoop/import synchronization owns supplier source fields, prices, stock, technical specifications, brand, category, SKU, and images. BretuneTech SEO fields are separate and are never updated during a supplier synchronization.

`seoLocked` prevents automated generation and the backfill from changing BretuneTech SEO fields. Administrators can edit the product SEO layer in the SEO Center.

## Deployment

1. Deploy backend and frontend code.
2. Run `npx prisma migrate deploy` in `backend`.
3. Run `npm run prisma:generate` in `backend`.
4. Run `npm run seo:backfill-products` in `backend` once.
5. Review the JSON output from `npm run seo:audit-products`.
6. Build and restart backend and frontend services.

## Slugs and redirects

Product slugs are assigned once at creation and remain stable when imports update supplier titles or specifications. A manual slug change made through the product API creates a permanent redirect record from the previous slug to the new one.

## Indexing

Only active, published products that are not marked `noIndex` are returned by the public product API and included in the sitemap. Draft, inactive, and deleted products return a real not-found response through the product route rather than a normal product page.

## Verification

Run:

```powershell
npm run build
npm run seo:audit-products
```

from `backend`, and:

```powershell
npm run lint
npm run build
```

from `frontend`.
