export const runtime = 'nodejs';

export default async function AdminLoginPage() {
  return (
    <section className="p-4 grid gap-4 max-w-md">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      <form className="grid gap-3">
        <input className="input" placeholder="Email" />
        <input className="input" placeholder="Password" type="password" />
        <button className="btn btn-primary" type="submit">Login</button>
      </form>
    </section>
  );
}