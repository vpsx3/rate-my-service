# Rate My Service

A social platform for Tibia servicers — find, rate, and vouch for trusted service providers.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth, Database, Storage)
- **Tailwind CSS** + custom shadcn-style components
- **next-intl** (PT-BR / EN bilingual)
- **Sonner** for toast notifications
- **Vercel** for deployment

---

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd rate-my-service
npm install
```

### 2. Supabase project

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
3. In **Authentication > Providers**, enable **Google OAuth**:
   - Add your Google Client ID and Secret (from Google Cloud Console)
   - Set the redirect URL: `https://your-project.supabase.co/auth/v1/callback`
4. In Google Cloud Console, add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/pt/auth/callback` (for local dev)

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/pt` by default.

---

## Deploy to Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Set `NEXT_PUBLIC_APP_URL` to your production URL
5. In Supabase Auth settings, add your Vercel URL to allowed redirect URLs

---

## Features

- **Landing page** with hero, search, and top servicers grid
- **Explore** page with filters (server, vocation, service type, price model, availability, rating)
- **Public profiles** with reviews, vouches, tier badge, and service info
- **Onboarding** flow after first Google login
- **Dashboard** with tabs for reviews/vouches, availability toggle
- **Settings** with profile editing, avatar upload, and servicer profile management
- **Tier system**: Bronze 🥉 → Silver 🥈 → Gold 🥇 → Diamond 💎
- **Bilingual**: PT-BR / EN via URL prefix (`/pt`, `/en`)

---

## Database Schema

See `supabase/schema.sql` for the full schema with RLS policies.

Tables: `profiles`, `servicer_profiles`, `reviews`, `vouches`
