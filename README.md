# VoltNet Solutions

**Powering Technology. Connecting Everything.**

A modern, scalable full-stack eCommerce platform for IT hardware, power solutions, networking equipment, and technology accessories.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, Zustand
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT-based authentication
- **Styling:** Tailwind CSS (dark premium theme)

## Project Structure

```
voltnet/
├── frontend/          # Next.js frontend
│   └── src/
│       ├── app/       # Pages (App Router)
│       ├── components/# Reusable components
│       ├── lib/       # API client, utils
│       └── store/     # Zustand stores
├── backend/           # Express API backend
│   ├── prisma/        # Database schema
│   └── src/
│       ├── lib/       # Prisma client, JWT
│       ├── middleware/ # Auth middleware
│       ├── modules/   # API modules
│       └── utils/     # Helpers
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, categories, featured products, bundles |
| `/products` | Product listing with search, filter, sort |
| `/products/[slug]` | Product detail page |
| `/bundles` | Bundle listing page |
| `/bundles/[slug]` | Bundle detail page |
| `/cart` | Shopping cart |
| `/checkout` | Checkout with shipping & payment |
| `/login` | Login / Register |
| `/account` | Customer dashboard (orders, profile, addresses) |
| `/admin` | Admin dashboard (products, bundles, orders, inventory, analytics) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user profile |
| GET | `/api/products` | List products (search, filter, paginate) |
| GET | `/api/products/:slug` | Get product by slug |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| GET | `/api/categories` | List categories |
| GET | `/api/bundles` | List bundles |
| GET | `/api/bundles/:slug` | Get bundle by slug |
| POST | `/api/bundles` | Create bundle (admin) |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/:id` | Update cart item quantity |
| DELETE | `/api/cart/items/:id` | Remove cart item |
| POST | `/api/orders` | Create order from cart |
| GET | `/api/orders` | List customer orders |
| GET | `/api/orders/:id/whatsapp` | Generate WhatsApp order message |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/orders` | All orders (admin) |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/inventory` | Inventory overview |
| GET | `/api/admin/analytics/best-sellers` | Best selling products |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### 1. Backend Setup

```bash
cd backend

# Copy environment file and update DATABASE_URL
cp .env.example .env

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`, Backend API on `http://localhost:4000`.

### Demo Credentials
- **Admin:** admin@voltnet.co.za / admin123

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/voltnet?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

### Frontend
Set `NEXT_PUBLIC_API_URL=http://localhost:4000/api` in your environment.

## Deployment

- **Frontend:** Deploy to Vercel (`vercel deploy`)
- **Backend:** Deploy to Railway or Render
- **Database:** Use a managed PostgreSQL service (Supabase, Neon, Railway)

## Features

- Product catalog with search, filtering, and sorting
- Bundle/kit system with savings calculation
- Shopping cart (persisted via Zustand)
- Checkout with EFT and WhatsApp order support
- JWT authentication (register/login)
- Admin dashboard with analytics, order management, inventory tracking
- Customer dashboard with order history
- Mobile-first responsive design
- Dark premium UI theme
- Future marketplace support (vendor model in schema)

## License

MIT
