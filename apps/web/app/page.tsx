export const runtime = 'nodejs';

export default async function HomePage() {
  return (
    <section className="p-6">
      <div className="grid gap-6">
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-600 p-8">
          <h1 className="text-2xl font-bold">Welcome to ACME Store</h1>
          <p className="text-gray-600 dark:text-gray-200">Home sections will load from Supabase.</p>
        </div>
      </div>
    </section>
  );
}