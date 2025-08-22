-- Required extension for gen_random_uuid
create extension if not exists pgcrypto;

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price_cents integer not null check (price_cents >= 0),
  image_url text,
  created_at timestamp with time zone default now()
);

-- Users are Supabase auth users. Profiles table for additional info
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Carts and items
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  created_at timestamp with time zone default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'pending',
  subtotal_cents integer not null default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null,
  created_at timestamp with time zone default now()
);

-- Addresses
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  label text not null default 'Default',
  name text,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text,
  country text not null,
  phone text,
  is_default boolean not null default false,
  created_at timestamp with time zone default now()
);

-- RLS
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.addresses enable row level security;

-- Policies
create policy if not exists "Products readable by anyone" on public.products for select using (true);
create policy if not exists "Products writable by service role" on public.products for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy if not exists "Users can select their profile" on public.profiles for select using (auth.uid() = id);
create policy if not exists "Users can update their profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy if not exists "Users can manage their cart" on public.carts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists "Users can manage their cart items" on public.cart_items for all using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())) with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

create policy if not exists "Users can read their orders" on public.orders for select using (user_id = auth.uid());
create policy if not exists "Users can read their order items" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy if not exists "Users can manage their addresses" on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Create profile row on new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create order from cart RPC
create or replace function public.create_order_from_cart()
returns uuid as $$
declare
  cart_id uuid;
  new_order_id uuid;
begin
  select id into cart_id from public.carts where user_id = auth.uid() limit 1;
  if cart_id is null then
    raise exception 'No cart for user';
  end if;

  insert into public.orders (user_id, status, subtotal_cents)
  values (auth.uid(), 'pending', 0)
  returning id into new_order_id;

  insert into public.order_items (order_id, product_id, quantity, unit_price_cents)
  select new_order_id, ci.product_id, ci.quantity, p.price_cents
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.cart_id = cart_id;

  update public.orders o
  set subtotal_cents = (
    select coalesce(sum(quantity * unit_price_cents), 0) from public.order_items where order_id = new_order_id
  )
  where o.id = new_order_id;

  delete from public.cart_items where cart_id = cart_id;

  return new_order_id;
end;
$$ language plpgsql security definer;

grant execute on function public.create_order_from_cart() to authenticated;

