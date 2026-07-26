# BretuneTech

**Enterprise Technology. Reliable Connectivity.**

Full-stack ecommerce + networking services platform for Bretune Technologies (Pty) Ltd — shop networking, power, and computing products, and book Cape Town / South Africa install services.

**Live:** [https://bretunetech.com](https://bretunetech.com)  
**API:** [https://api.bretunetech.com](https://api.bretunetech.com)  
**Server:** `161.97.120.107`

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS, Zustand, shadcn/ui
- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Auth:** JWT
- **Deploy:** VPS with nginx + PM2 (`deploy.sh`, `ecosystem.config.js`)

## Project structure

```
bretunetech/
├── frontend/          # Next.js storefront + admin UI
├── backend/           # Express API + Prisma
├── nginx/             # Site config (HTTPS, www→apex)
├── deploy.sh          # VPS deploy helper
└── ecosystem.config.js
```

## Environment

### Backend (`backend/.env`)

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL, JWT secrets, SMTP, CORS_ORIGIN, FRONTEND_URL
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

### Frontend (`frontend/.env.local`)

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=https://api.bretunetech.com/api
npm install
npm run build
```

Optional analytics / verification (frontend env):

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_BING_SITE_VERIFICATION`

## Deploy (VPS `161.97.120.107`)

1. Push to the `production` git remote (or run `deploy.sh` on the VPS).
2. Nginx: install `nginx/bretunetech.conf`, ensure Certbot certs exist, `nginx -t && systemctl reload nginx`.
3. Confirm redirects: `http://` and `www.` → `https://bretunetech.com`.
4. Optional SEO smoke: `cd frontend && BASE_URL=https://bretunetech.com npm run seo:smoke`

`frontend/netlify.toml` is **not** used for hosting (VPS-only).

## SEO ops

- Admin: `/admin/seo` (Dashboard, Audit, Ops Cadence)
- Product audit CLI: `cd backend && npm run seo:audit-products`
- Product SEO notes: `docs/product-seo.md`

## Key store routes

| Route | Purpose |
|-------|---------|
| `/` | Home |
| `/products`, `/products/[slug]` | Catalog / PDP |
| `/services`, `/services/[slug]` | Install service landings |
| `/quote`, `/services/book`, `/contact` | Lead capture |
| `/cart`, `/checkout`, `/account` | Private funnels (noindex) |
| `/admin` | Admin dashboard |

## License

Private — Bretune Technologies (Pty) Ltd.
