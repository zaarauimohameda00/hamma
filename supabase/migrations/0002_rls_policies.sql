-- Enable RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.site_content enable row level security;
alter table public.site_settings enable row level security;
alter table public.i18n_namespaces enable row level security;
alter table public.i18n_translations enable row level security;
alter table public.analytics_events enable row level security;

-- Public read policies for content tables
create policy if not exists "Public read categories" on public.categories for select using (true);
create policy if not exists "Public read products" on public.products for select using (is_active = true);
create policy if not exists "Public read product_variants" on public.product_variants for select using (true);
create policy if not exists "Public read site_content" on public.site_content for select using (true);
create policy if not exists "Public read site_settings" on public.site_settings for select using (true);
create policy if not exists "Public read i18n namespaces" on public.i18n_namespaces for select using (true);
create policy if not exists "Public read i18n translations" on public.i18n_translations for select using (true);

-- Profiles
create policy if not exists "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy if not exists "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Cart items
create policy if not exists "Users manage own cart" on public.cart_items for all
  using ((user_id is null and guest_token is not null) or (user_id = auth.uid()))
  with check ((user_id = auth.uid()) or (user_id is null));

-- Orders
create policy if not exists "Users read own orders" on public.orders for select using (user_id = auth.uid());
create policy if not exists "Users insert own orders" on public.orders for insert with check (user_id = auth.uid());
create policy if not exists "Admins manage orders" on public.orders for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Order items
create policy if not exists "Users read own order_items" on public.order_items for select using (
  exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

-- Wishlist
create policy if not exists "Users manage own wishlist" on public.wishlist_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Newsletter (public insert)
create policy if not exists "Public subscribe newsletter" on public.newsletter_subscribers for insert with check (true);
create policy if not exists "No read newsletter" on public.newsletter_subscribers for select to authenticated using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Analytics (insert by anyone auth, read admin)
create policy if not exists "Auth insert analytics" on public.analytics_events for insert with check (auth.uid() is not null);
create policy if not exists "Admin read analytics" on public.analytics_events for select using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);