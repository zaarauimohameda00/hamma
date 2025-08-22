export const runtime = 'nodejs';

export default async function AdminProductsPage() {
  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold">Products</h1>
      <p className="text-gray-600 dark:text-gray-200">CRUD UI will load products from API.</p>
    </section>
  );
}