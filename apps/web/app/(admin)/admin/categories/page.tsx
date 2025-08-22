export const runtime = 'nodejs';

export default async function AdminCategoriesPage() {
  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold">Categories</h1>
      <p className="text-gray-600 dark:text-gray-200">CRUD UI will load categories from API.</p>
    </section>
  );
}