import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  return createClient(url, anon, { auth: { persistSession: false } });
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = getClient();
  const sp = await searchParams;
  const q = String(sp.q ?? '').trim();
  const category = String(sp.category ?? '') || undefined;
  const min = sp.min ? Number(sp.min) : undefined;
  const max = sp.max ? Number(sp.max) : undefined;
  const availability = String(sp.availability ?? '') || undefined; // 'in-stock'
  const sort = String(sp.sort ?? 'created_at:desc');
  const [column, dir] = sort.split(':');
  const ascending = dir !== 'desc';

  const page = Number(sp.page ?? 1);
  const pageSize = 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let builder = supabase.from('products').select('*', { count: 'exact' }).order(column, { ascending }).range(from, to);

  if (q) builder = builder.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  if (category) builder = builder.eq('category_id', category);
  if (min !== undefined) builder = builder.gte('price', min);
  if (max !== undefined) builder = builder.lte('price', max);
  if (availability === 'in-stock') builder = builder.gt('stock_quantity', 0);

  const { data, count } = await builder;

  return (
    <section className="p-4 grid gap-6">
      <h1 className="text-2xl font-bold">Search</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {data?.map((p) => (
          <a key={p.id} href={`/product/${p.id}`} className="rounded-2xl border border-gray-200 dark:border-gray-600 p-3 hover:shadow">
            <div className="aspect-square rounded-xl bg-gray-50 dark:bg-gray-600 mb-2" />
            <div className="text-sm font-medium line-clamp-1">{p.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-200">${Number(p.price).toFixed(2)}</div>
          </a>
        ))}
      </div>
    </section>
  );
}