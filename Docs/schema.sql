-- FirstNest database schema
-- Run once in Supabase SQL Editor

-- profiles extends auth.users with public display data
create table if not exists public.profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  display_name text        not null default '',
  avatar_url   text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: anyone can read"
  on public.profiles for select using (true);

create policy "Profiles: owner can upsert"
  on public.profiles for all using (auth.uid() = id);

-- trigger: create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',
             split_part(new.email, '@', 1),
             'User'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- listings
create table if not exists public.listings (
  id          bigserial   primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  title       text        not null,
  city        text        not null default 'Tampere',
  district    text        not null,
  price       integer     not null check (price > 0),
  size        integer     not null check (size > 0),
  rooms       integer     not null check (rooms > 0),
  type        text        not null check (type in ('apartment','rowhouse','house','studio')),
  description text,
  badge       text,
  tags        text[]      not null default '{}',
  area_score  integer     not null default 70 check (area_score between 0 and 100),
  profile     text[]      not null default '{"all"}',
  lat         double precision,
  lng         double precision,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists listings_created_at_idx    on public.listings (created_at desc);
create index if not exists listings_city_district_idx on public.listings (city, district);
create index if not exists listings_price_idx         on public.listings (price);

alter table public.listings enable row level security;

create policy "Listings: anyone can read"
  on public.listings for select using (true);

create policy "Listings: owner can insert"
  on public.listings for insert with check (auth.uid() = user_id);

create policy "Listings: owner can update"
  on public.listings for update using (auth.uid() = user_id);

create policy "Listings: owner can delete"
  on public.listings for delete using (auth.uid() = user_id);

-- trigger: keep updated_at current
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger listings_updated_at
  before update on public.listings
  for each row execute function public.touch_updated_at();


-- favourites
create table if not exists public.favourites (
  user_id    uuid    not null references auth.users(id) on delete cascade,
  listing_id bigint  not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists favourites_user_idx on public.favourites (user_id);

alter table public.favourites enable row level security;

create policy "Favourites: owner can read own"
  on public.favourites for select using (auth.uid() = user_id);

create policy "Favourites: owner can insert"
  on public.favourites for insert with check (auth.uid() = user_id);

create policy "Favourites: owner can delete"
  on public.favourites for delete using (auth.uid() = user_id);


-- Google OAuth: Supabase Dashboard → Authentication → Providers → Google
