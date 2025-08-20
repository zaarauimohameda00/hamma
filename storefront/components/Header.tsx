import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">Store</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/products" className="hover:underline">Products</Link>
          <Link href="/cart" className="hover:underline">Cart</Link>
          <Link href="/account" className="hover:underline">Account</Link>
          <Link href="/admin" className="hover:underline">Admin</Link>
        </nav>
      </div>
    </header>
  )
}

