# ACME E-commerce Monorepo

Tech stack: Next.js 15 (React 19, TS), Express 5 (TS), Supabase (Auth, Postgres, Storage), Tailwind CSS.

## Apps
- apps/web: Next.js storefront and admin dashboard (RSC + Server Actions)
- apps/api: Express API (Supabase integration, Zod, CORS, rate limit, PDF, uploads)

## Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase project (URL, anon key, service role key)

## Environment
Copy `.env.example` to `.env` at root and fill values. Also copy to `apps/web/.env` and `apps/api/.env` if you prefer per-app files.

Required:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only)
- SUPABASE_JWT_SECRET
- APP_BASE_URL (default http://localhost:3000)
- EXPRESS_BASE_URL (default http://localhost:4000)
- SUPABASE_BUCKET_PRODUCTS (default product-images)

## Database
Run SQL migrations in order in Supabase SQL editor or CLI:
- `supabase/migrations/0001_schema.sql`
- `supabase/migrations/0002_rls_policies.sql`
- `supabase/migrations/0003_functions.sql`

Then seed:
```bash
pnpm ts-node scripts/seed.ts
```
Ensure you created the admin auth user first, then re-run seed to promote role.

Create public storage bucket:
- Create bucket `product-images` (public). Upload placeholder image `placeholder.jpg` if using the seed as-is.

## Install & Run
```bash
pnpm install
pnpm dev
```
- Web: http://localhost:3000
- API: http://localhost:4000

## Notes
- No local/mock data: all reads/writes use Supabase. The Home page fetches `site_content`, `categories`, and featured `products` directly via RSC.
- Auth: Use Supabase Auth. Admin is controlled by `profiles.role = 'admin'`.
- Do not expose service role key in the browser. Only the API uses it.

## Scripts
- `pnpm -r build` build all
- `pnpm --filter @acme/api dev` API dev server
- `pnpm --filter @acme/web dev` Web dev server

## Testing (placeholder)
- Add Vitest and Playwright configs and tests under each app.

## Deployment
- Web: Vercel (set env vars). Mark heavy routes with `export const runtime = 'nodejs'`.
- API: Render/Fly/any Node host. Set CORS to APP_BASE_URL.
- Supabase: set Storage bucket public. Apply SQL migrations via migration tool or SQL editor.