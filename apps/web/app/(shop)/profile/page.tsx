import { getSupabaseServerClient } from '../../../lib/supabaseServer';

export const runtime = 'nodejs';

export default async function ProfilePage() {
  const supabase = getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p>Please login to view your profile.</p>
      </section>
    );
  }

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', auth.user.id).single(),
    supabase.from('orders').select('*, order_items(*, products(name))').eq('user_id', auth.user.id).order('created_at', { ascending: false }),
  ]);

  return (
    <section className="p-4 grid gap-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-600 p-4">
        <div className="font-medium">{profile?.full_name ?? auth.user.email}</div>
        <div className="text-sm text-gray-600 dark:text-gray-200">Role: {profile?.role ?? 'user'}</div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Order history</h2>
        <div className="grid gap-3">
          {orders?.map((o) => (
            <div key={o.id} className="rounded-2xl border border-gray-200 dark:border-gray-600 p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">Order #{o.id.slice(0, 8)}</div>
                <div className="text-sm">{o.status}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-200">Total: ${Number(o.total).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}