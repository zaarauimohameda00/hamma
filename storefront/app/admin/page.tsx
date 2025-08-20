import Link from 'next/link'

export default function AdminDashboardPage() {
  return (
    <main className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Admin dashboard</h1>
        <Link href="/admin/products" className="rounded-md bg-foreground px-4 py-2 text-background hover:opacity-90">New product</Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <div className="text-sm text-muted-foreground">Sales</div>
          <div className="mt-2 text-2xl font-medium">$0.00</div>
        </div>
        <div className="rounded-lg border p-6">
          <div className="text-sm text-muted-foreground">Orders</div>
          <div className="mt-2 text-2xl font-medium">0</div>
        </div>
        <div className="rounded-lg border p-6">
          <div className="text-sm text-muted-foreground">Products</div>
          <div className="mt-2 text-2xl font-medium">0</div>
        </div>
      </div>
      <div className="mt-8 overflow-hidden rounded-lg border">
        <img src="/dashboard-ui.webp" alt="Dashboard design" className="w-full" />
      </div>
    </main>
  )
}

