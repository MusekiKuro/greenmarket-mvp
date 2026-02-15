# Marketplace MVP

C2C/B2C Marketplace built with Next.js 14, Supabase, Tailwind CSS, and shadcn/ui.

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Get your Supabase URL and anon key from [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api).

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous (public) key |

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migration from `supabase/migrations/20250213000000_initial_schema.sql` in the SQL Editor
3. **Disable email confirmation** (recommended for dev): Supabase Dashboard → Authentication → Providers → Email → turn OFF "Confirm email"
4. **Or use test data**: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (Settings → API → service_role), then run `npm run seed`

### Test accounts (after `npm run seed`)

| Email | Password | Role |
|-------|----------|------|
| buyer@test.com | password123 | Buyer |
| seller@test.com | password123 | Seller |
| admin@test.com | password123 | Admin |

## Project Structure

```
/app
  /(auth)        → /login, /register
  /(public)      → / (Landing), /search, /product/[id]
  /(dashboard)   → /dashboard/seller, /dashboard/buyer
/components
  /ui            → shadcn primitives
  /features      → /auth, /product, /cart, /checkout
/lib
  /supabase      → client.ts, server.ts, middleware.ts
```
