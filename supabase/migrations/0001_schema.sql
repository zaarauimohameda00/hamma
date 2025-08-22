-- Enable required extensions
create extension if not exists pgcrypto with schema public;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamp with time zone default now()
);

-- Handle new user -> profile row
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  images jsonb not null default '[]'::jsonb,
  category_id uuid not null references public.categories(id) on delete restrict,
  is_active boolean not null default true,
  featured boolean not null default false,
  stock_quantity integer not null default 0,
  popularity integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active_featured on public.products(is_active, featured);
create index if not exists idx_products_slug on public.products(slug);

-- Product variants
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  value text not null,
  stock_quantity integer not null default 0,
  price_delta numeric(10,2) not null default 0
);

-- Cart items
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  guest_token text,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null check (quantity > 0),
  created_at timestamp with time zone default now(),
  constraint cart_user_or_guest check ((user_id is not null) or (guest_token is not null))
);

-- Uniqueness for cart rows per owner/product/variant
create unique index if not exists ux_cart_by_user on public.cart_items(user_id, product_id, variant_id) where user_id is not null;
create unique index if not exists ux_cart_by_guest on public.cart_items(guest_token, product_id, variant_id) where guest_token is not null;

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  country text not null,
  city text not null,
  email text not null,
  zip_code text not null,
  subtotal numeric(10,2) not null,
  tax numeric(10,2) not null,
  total numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled','refunded')),
  created_at timestamp with time zone default now()
);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- Wishlist
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

-- Newsletter
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamp with time zone default now()
);

-- Site content
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default now()
);

-- Site settings
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null
);

-- i18n
create table if not exists public.i18n_namespaces (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists public.i18n_translations (
  id uuid primary key default gen_random_uuid(),
  namespace_id uuid references public.i18n_namespaces(id) on delete cascade,
  lang text not null check (lang in ('en','ar','es')),
  key text not null,
  value text not null,
  unique(namespace_id, lang, key)
);

-- Analytics events
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  event_type text not null,
  payload jsonb,
  created_at timestamp with time zone default now()
);