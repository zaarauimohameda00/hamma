export const runtime = 'nodejs';

export default async function AdminDashboardPage() {
  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-200">Analytics charts will render here from API.</p>
    </section>
  );
}