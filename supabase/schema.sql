-- ============================================================
-- Rate My Service — Supabase Schema + RLS Policies
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users primary key,
  character_name text not null,
  server text not null,
  vocation text check (vocation in ('EK','RP','ED','MS','None')),
  role text[] default array['client'],
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- Servicer profiles
create table if not exists servicer_profiles (
  id uuid references profiles primary key,
  service_types text[],
  price_model text check (price_model in ('hourly','per_session','per_level','negotiable')),
  price_min numeric,
  price_max numeric,
  currency text default 'gold',
  availability text,
  rules text,
  is_available boolean default false,
  updated_at timestamptz default now()
);

-- Reviews
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references profiles not null,
  to_user_id uuid references profiles not null,
  rating int check (rating between 1 and 5) not null,
  service_type text,
  body text,
  verified boolean default false,
  created_at timestamptz default now(),
  unique (from_user_id, to_user_id)
);

-- Vouches
create table if not exists vouches (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references profiles not null,
  to_user_id uuid references profiles not null,
  body text not null,
  created_at timestamptz default now(),
  unique (from_user_id, to_user_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table servicer_profiles enable row level security;
alter table reviews enable row level security;
alter table vouches enable row level security;

-- Profiles: anyone can read, owner can update/insert
create policy "profiles_select" on profiles
  for select using (true);

create policy "profiles_insert" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on profiles
  for update using (auth.uid() = id);

-- Servicer profiles: anyone can read, owner can update/insert
create policy "servicer_profiles_select" on servicer_profiles
  for select using (true);

create policy "servicer_profiles_insert" on servicer_profiles
  for insert with check (auth.uid() = id);

create policy "servicer_profiles_update" on servicer_profiles
  for update using (auth.uid() = id);

-- Reviews: anyone can read, authenticated users can insert (not own profile)
create policy "reviews_select" on reviews
  for select using (true);

create policy "reviews_insert" on reviews
  for insert with check (
    auth.uid() = from_user_id
    and auth.uid() != to_user_id
  );

-- Profile owner can mark reviews as verified
create policy "reviews_update_verified" on reviews
  for update using (auth.uid() = to_user_id)
  with check (auth.uid() = to_user_id);

-- Vouches: anyone can read, authenticated users can insert (not own profile)
create policy "vouches_select" on vouches
  for select using (true);

create policy "vouches_insert" on vouches
  for insert with check (
    auth.uid() = from_user_id
    and auth.uid() != to_user_id
  );

-- ============================================================
-- Storage bucket for avatars
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

create policy "avatars_select" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
