import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server-client'
import { addToCart } from '@/app/(store)/cart/actions'
import { AddToCartButton } from './AddToCartButton'

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price_cents: number
  image_url: string | null
}

async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient()
  const { data } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
  return (data as any) ?? null
}

export default async function ProductDetail({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) return notFound()
  return (
    <main className="container py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded-md border bg-muted" />
        <div>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <div className="mt-2 text-2xl">${(product.price_cents / 100).toFixed(2)}</div>
          {product.description && (
            <p className="prose mt-4 max-w-prose text-muted-foreground">{product.description}</p>
          )}
          <form className="mt-6 flex items-center gap-3" action={async () => {
            'use server'
            await addToCart(product.id, 1)
          }}>
            <AddToCartButton />
            <Link href="/cart" className="rounded-md border px-4 py-2 hover:bg-muted">View cart</Link>
          </form>
        </div>
      </div>
    </main>
  )
}

