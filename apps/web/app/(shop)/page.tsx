import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  return createClient(url, anon, { auth: { persistSession: false } });
}

export default async function HomeShopPage() {
  const supabase = getClient();
  const [{ data: hero }, { data: categories }, { data: featured }] = await Promise.all([
    supabase.from('site_content').select('*').eq('key', 'home.hero').maybeSingle(),
    supabase.from('categories').select('*').order('name'),
    supabase.from('products').select('*').eq('is_active', true).eq('featured', true).limit(12),
  ]);

  const heroData = hero?.value ?? { heading: 'Welcome', subheading: '', cta_label: 'Shop', cta_href: '/search' };

  return (
    <section className="p-6 grid gap-8">
      <div className="rounded-2xl bg-gray-50 dark:bg-gray-600 p-8">
        <h1 className="text-2xl font-bold">{heroData.heading}</h1>
        <p className="text-gray-600 dark:text-gray-200">{heroData.subheading}</p>
        <a className="btn btn-primary mt-4 inline-block" href={heroData.cta_href}>{heroData.cta_label}</a>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories?.map((c) => (
            <a key={c.id} className="rounded-2xl border border-gray-200 dark:border-gray-600 p-4 hover:shadow" href={`/category/${c.slug}`}>
              <span className="font-medium">{c.name}</span>
            </a>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Featured</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {featured?.map((p) => (
            <a key={p.id} href={`/product/${p.id}`} className="rounded-2xl border border-gray-200 dark:border-gray-600 p-3 hover:shadow">
              <div className="aspect-square rounded-xl bg-gray-50 dark:bg-gray-600 mb-2" />
              <div className="text-sm font-medium line-clamp-1">{p.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-200">${Number(p.price).toFixed(2)}</div>
            </a>
          ))}
        </div>
      </div>

      <form action="/api/express-proxy?path=/content/newsletter" method="post" className="grid gap-2 max-w-md">
        <input name="email" className="input" placeholder="Your email" />
        <button className="btn btn-secondary" type="submit">Subscribe</button>
      </form>
    </section>
  );
}