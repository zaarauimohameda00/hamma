-- Allow guest orders by making user_id nullable
alter table public.orders alter column user_id drop not null;