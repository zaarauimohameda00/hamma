-- Sales overview: returns date, total for range
create or replace function public.get_sales_overview(from timestamp with time zone default null, to timestamp with time zone default null)
returns table(day date, total numeric)
language sql stable as $$
  select date_trunc('day', o.created_at)::date as day, sum(o.total) as total
  from public.orders o
  where (from is null or o.created_at >= from)
    and (to is null or o.created_at <= to)
    and o.status in ('paid','shipped','delivered')
  group by 1
  order by 1;
$$;

-- Best selling products
create or replace function public.get_best_selling_products(from timestamp with time zone default null, to timestamp with time zone default null)
returns table(product_id uuid, quantity bigint)
language sql stable as $$
  select oi.product_id, sum(oi.quantity) as quantity
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where (from is null or o.created_at >= from)
    and (to is null or o.created_at <= to)
    and o.status in ('paid','shipped','delivered')
  group by 1
  order by 2 desc;
$$;

-- Orders by category
create or replace function public.get_orders_by_category(from timestamp with time zone default null, to timestamp with time zone default null)
returns table(category_id uuid, category_name text, orders_count bigint)
language sql stable as $$
  select p.category_id, c.name as category_name, count(distinct oi.order_id) as orders_count
  from public.order_items oi
  join public.products p on p.id = oi.product_id
  join public.orders o on o.id = oi.order_id
  join public.categories c on c.id = p.category_id
  where (from is null or o.created_at >= from)
    and (to is null or o.created_at <= to)
    and o.status in ('paid','shipped','delivered')
  group by 1,2
  order by 3 desc;
$$;