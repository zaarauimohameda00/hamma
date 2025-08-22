import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  return createClient(url, anon, { auth: { persistSession: false } });
}

export default async function CategoryPage({ params, searchParams }: { params: { slug: string }; searchParams: Record<string, string | string[] | undefined> }) {
  const supabase = getClient();
  const { data: category } = await supabase.from('categories').select('*').eq('slug', params.slug).single();
  if (!category) return null;

  const page = Number(searchParams.page ?? 1);
  const pageSize = 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const sort = String(searchParams.sort ?? 'created_at:desc');
  const [column, dir] = sort.split(':');
  const ascending = dir !== 'desc';

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order(column, { ascending })
    .range(from, to);

  return (
    <section className="p-4 grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize">{category.name}</h1>
        <select className="input" defaultValue={sort} onChange={(e) => { location.search = `?sort=${e.currentTarget.value}`; }}>
          <option value="created_at:desc">Newest</option>
          <option value="price:asc">Price: Low → High</option>
          <option value="price:desc">Price: High → Low</option>
          <option value="popularity:desc">Popularity</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {products?.map((p) => (
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