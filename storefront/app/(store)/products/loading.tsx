export default function Loading() {
  return (
    <main className="container py-10">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="h-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </main>
  )
}

