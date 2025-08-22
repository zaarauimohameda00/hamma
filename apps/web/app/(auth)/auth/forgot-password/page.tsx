export const runtime = 'nodejs';

export default async function ForgotPasswordPage() {
  return (
    <section className="p-4 grid gap-4 max-w-md">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <form className="grid gap-3">
        <input className="input" placeholder="Email" />
        <button className="btn btn-primary" type="submit">Send reset link</button>
      </form>
    </section>
  );
}