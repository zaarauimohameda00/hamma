import Link from 'next/link'

export default function AdminProductsPage() {
  return (
    <main className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="rounded-md bg-foreground px-4 py-2 text-background hover:opacity-90">Add product</Link>
      </div>
      <div className="rounded-lg border p-6 text-muted-foreground">No products yet.</div>
    </main>
  )
}

