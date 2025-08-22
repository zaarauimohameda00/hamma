import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="container py-10">
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Your Next.js + Supabase Store</h1>
        <p className="max-w-2xl text-muted-foreground">
          Fully featured e-commerce starter: products, cart, checkout, accounts, and an admin dashboard.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/products" className="rounded-md bg-foreground px-4 py-2 text-background hover:opacity-90">
            Shop products
          </Link>
          <Link href="/account" className="rounded-md border px-4 py-2 hover:bg-muted">
            Your account
          </Link>
          <Link href="/admin" className="rounded-md border px-4 py-2 hover:bg-muted">
            Admin dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}

