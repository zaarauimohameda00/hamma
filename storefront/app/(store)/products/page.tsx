import Link from 'next/link'
import { createClient } from '@/lib/supabase/server-client'

type Product = {
  id: string
  name: string
  slug: string
  price_cents: number
  image_url: string | null
}

async function getProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data } = await supabase.from('products').select('id, name, slug, price_cents, image_url').order('created_at', { ascending: false })
  return (data as any) ?? []
}

export default async function ProductsPage() {
  const products = await getProducts()
  return (
    <main className="container py-10">
      <h1 className="mb-6 text-3xl font-semibold">Products</h1>
      {products.length === 0 && (
        <div className="text-muted-foreground">No products yet. Sign in to the admin to add some.</div>
      )}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className="group rounded-lg border p-3 hover:shadow">
            <div className="aspect-square w-full overflow-hidden rounded-md bg-muted" />
            <div className="mt-3">
              <div className="line-clamp-1 font-medium group-hover:underline">{p.name}</div>
              <div className="text-sm text-muted-foreground">${(p.price_cents / 100).toFixed(2)}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

