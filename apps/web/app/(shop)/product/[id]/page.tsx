import { createClient } from '@supabase/supabase-js';
import { addToCart } from '../../../actions';

export const runtime = 'nodejs';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  return createClient(url, anon, { auth: { persistSession: false } });
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = getClient();
  const { data: product } = await supabase
    .from('products')
    .select('*, product_variants(*), categories(name, slug)')
    .eq('id', params.id)
    .single();

  if (!product) return null;

  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(8);

  return (
    <section className="grid lg:grid-cols-2 gap-8 p-4">
      <div>
        <div className="aspect-square rounded-2xl bg-gray-50 dark:bg-gray-600" />
      </div>
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <div className="text-gray-600 dark:text-gray-200">${Number(product.price).toFixed(2)}</div>
        <p>{product.description}</p>
        <form action={async (formData) => {
          'use server';
          const quantity = Number(formData.get('quantity') || '1');
          const variant_id = String(formData.get('variant_id') || '') || null;
          await addToCart({ product_id: product.id, variant_id, quantity });
        }} className="grid gap-3 max-w-xs">
          {product.product_variants?.length ? (
            <select name="variant_id" className="input">
              <option value="">Select variant</option>
              {product.product_variants.map((v: any) => (
                <option key={v.id} value={v.id}>{v.name}: {v.value}</option>
              ))}
            </select>
          ) : null}
          <input className="input" name="quantity" type="number" defaultValue={1} min={1} />
          <button className="btn btn-primary" type="submit">Add to cart</button>
        </form>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-3">Related products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {related?.map((p) => (
            <a key={p.id} href={`/product/${p.id}`} className="rounded-2xl border border-gray-200 dark:border-gray-600 p-3 hover:shadow">
              <div className="aspect-square rounded-xl bg-gray-50 dark:bg-gray-600 mb-2" />
              <div className="text-sm font-medium line-clamp-1">{p.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-200">${Number(p.price).toFixed(2)}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}