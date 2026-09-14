-- ==============================================================================
-- CHẠM A LƯỚI - NỀN TẢNG DU LỊCH CỘNG ĐỒNG A LƯỚI
-- SUPABASE POSTGRESQL COMPLETE DATABASE SCHEMA
-- Hỗ trợ 17 bảng với RLS Policies cho: customer, business, admin
-- ==============================================================================

create extension if not exists "pgcrypto";

-- Enum types
create type public.user_role as enum ('customer', 'business', 'admin');
create type public.booking_status as enum ('new', 'contacted', 'confirmed', 'cancelled');
create type public.product_order_status as enum ('new', 'contacted', 'confirmed', 'cancelled');
create type public.business_status as enum ('pending', 'active', 'paused', 'rejected');
create type public.lead_status as enum ('new', 'consulting', 'converted', 'voucher_used', 'expired', 'cancelled');
create type public.voucher_status as enum ('unused', 'used', 'expired');
create type public.commission_status as enum ('pending_reconciliation', 'reconciled', 'invoiced', 'paid', 'cancelled');

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  business_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. BUSINESSES
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_name text,
  phone text,
  email text,
  zalo_url text,
  address text,
  default_commission_rate numeric(5,2) not null default 10 check (default_commission_rate >= 0),
  status public.business_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. PLACES
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  slug text not null unique,
  name text not null,
  category text not null,
  summary text not null,
  description text,
  address text,
  map_embed_url text,
  price_label text,
  voucher_offer text,
  commission_rate numeric(5,2) not null default 10 check (commission_rate >= 0),
  image_url text,
  gallery_urls text[] not null default '{}',
  services text[] not null default '{}',
  highlights text[] not null default '{}',
  activities text[] not null default '{}',
  suitable_for text[] not null default '{}',
  safety_notes text[] not null default '{}',
  rating numeric(3,2) not null default 4.8,
  review_count integer not null default 0,
  opening_hours text,
  phone text,
  zalo_url text,
  is_featured boolean not null default false,
  status text not null default 'active' check (status in ('active', 'temporarily_closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. PLACE_IMAGES
create table if not exists public.place_images (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 5. PLACE_SERVICES
create table if not exists public.place_services (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  name text not null,
  price_label text,
  description text,
  created_at timestamptz not null default now()
);

-- 6. PLACE_LEADS
create table if not exists public.place_leads (
  id uuid primary key default gen_random_uuid(),
  lead_code text not null unique,
  voucher_code text not null,
  place_id uuid references public.places(id) on delete set null,
  place_slug text not null,
  place_name text not null,
  business_id uuid references public.businesses(id) on delete set null,
  business_name text not null,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  expected_date date,
  guests integer not null default 1 check (guests > 0),
  need text,
  status public.lead_status not null default 'new',
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. VOUCHERS
create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  voucher_code text not null unique,
  lead_id uuid references public.place_leads(id) on delete cascade,
  place_id uuid references public.places(id) on delete set null,
  place_name text not null,
  discount_offer text not null,
  start_date date not null default current_date,
  expires_at date not null default (current_date + 30),
  status public.voucher_status not null default 'unused',
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.place_leads(id) on delete set null,
  voucher_code text not null,
  place_id uuid references public.places(id) on delete set null,
  place_name text not null,
  business_id uuid references public.businesses(id) on delete set null,
  business_name text not null,
  order_value integer not null check (order_value >= 0),
  commission_rate numeric(5,2) not null check (commission_rate >= 0),
  commission_amount integer not null check (commission_amount >= 0),
  status public.commission_status not null default 'pending_reconciliation',
  confirmed_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. COMMISSION_RECORDS
create table if not exists public.commission_records (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  period_month text not null, -- YYYY-MM
  amount integer not null check (amount >= 0),
  is_reconciled boolean not null default false,
  reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. TOUR_PACKAGES
create table if not exists public.tour_packages (
  id text primary key,
  name text not null,
  code text not null,
  duration text not null,
  price_from integer not null default 0,
  image_url text,
  description text,
  highlights text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 11. TOUR_REQUESTS
create table if not exists public.tour_requests (
  id uuid primary key default gen_random_uuid(),
  package_id text references public.tour_packages(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  start_date date,
  end_date date,
  guests integer not null default 1,
  note text,
  status public.booking_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 12. HOMESTAYS
create table if not exists public.homestays (
  id text primary key,
  name text not null,
  business_id uuid references public.businesses(id) on delete set null,
  address text,
  price_per_night integer not null default 0,
  image_url text,
  amenities text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 13. EXPERIENCES
create table if not exists public.experiences (
  id text primary key,
  name text not null,
  price_per_guest integer not null default 0,
  duration text,
  description text,
  created_at timestamptz not null default now()
);

-- 14. PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price integer not null check (price >= 0),
  unit text,
  image_url text,
  summary text,
  created_at timestamptz not null default now()
);

-- 15. PRODUCT_ORDERS
create table if not exists public.product_orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  quantity integer not null default 1 check (quantity > 0),
  address text,
  note text,
  status public.product_order_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 16. CHAT_CONVERSATIONS & CHAT_MESSAGES
create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.chat_conversations(id) on delete cascade,
  customer_name text,
  email text,
  phone text,
  message text not null,
  reply text,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 17. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_role public.user_role not null default 'admin',
  business_id uuid references public.businesses(id) on delete cascade,
  title text not null,
  content text not null,
  type text not null default 'lead',
  is_read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- TRIGGERS FOR updated_at
-- ==============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger businesses_set_updated_at before update on public.businesses for each row execute function public.set_updated_at();
create trigger places_set_updated_at before update on public.places for each row execute function public.set_updated_at();
create trigger place_leads_set_updated_at before update on public.place_leads for each row execute function public.set_updated_at();
create trigger vouchers_set_updated_at before update on public.vouchers for each row execute function public.set_updated_at();
create trigger transactions_set_updated_at before update on public.transactions for each row execute function public.set_updated_at();

-- Auto create profile on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.places enable row level security;
alter table public.place_images enable row level security;
alter table public.place_services enable row level security;
alter table public.place_leads enable row level security;
alter table public.vouchers enable row level security;
alter table public.transactions enable row level security;
alter table public.commission_records enable row level security;
alter table public.tour_requests enable row level security;
alter table public.tour_packages enable row level security;
alter table public.homestays enable row level security;
alter table public.experiences enable row level security;
alter table public.products enable row level security;
alter table public.product_orders enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;

-- Public read policies
create policy "Anyone can read active places" on public.places for select using (status = 'active');
create policy "Anyone can read place images" on public.place_images for select using (true);
create policy "Anyone can read place services" on public.place_services for select using (true);
create policy "Anyone can read tour packages" on public.tour_packages for select using (true);
create policy "Anyone can read homestays" on public.homestays for select using (true);
create policy "Anyone can read experiences" on public.experiences for select using (true);
create policy "Anyone can read products" on public.products for select using (true);

-- Public creation policies (Leads & Orders)
create policy "Anyone can create place leads" on public.place_leads for insert with check (true);
create policy "Anyone can create tour requests" on public.tour_requests for insert with check (true);
create policy "Anyone can create product orders" on public.product_orders for insert with check (true);
create policy "Anyone can create chat messages" on public.chat_messages for insert with check (true);

-- Profile policies
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Business policies
create policy "Businesses can read own data" on public.businesses for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'admin' or p.business_id = businesses.id))
);

create policy "Businesses can read own places" on public.places for select
using (
  status = 'active' or exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'admin' or p.business_id = places.business_id))
);

create policy "Businesses can read assigned leads" on public.place_leads for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'admin' or p.business_id = place_leads.business_id))
);

create policy "Businesses can read own transactions" on public.transactions for select
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and (p.role = 'admin' or p.business_id = transactions.business_id))
);

-- Admin full access
create policy "Admins have full access to profiles" on public.profiles for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins have full access to businesses" on public.businesses for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins have full access to places" on public.places for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins have full access to leads" on public.place_leads for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins have full access to vouchers" on public.vouchers for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins have full access to transactions" on public.transactions for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins have full access to commissions" on public.commission_records for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins have full access to notifications" on public.notifications for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
