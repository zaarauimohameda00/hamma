import { callApi } from '../../../lib/express';

export const runtime = 'nodejs';

export default async function CartPage() {
  const { data } = await callApi('/cart');
  const items = data as any[];
  const subtotal = items.reduce((sum, i) => sum + Number(i.products?.price ?? 0) * i.quantity, 0);

  return (
    <section className="p-4 grid gap-4">
      <h1 className="text-2xl font-bold">Cart</h1>
      <div className="grid gap-2">
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 py-2">
            <div>
              <div className="font-medium">{i.products?.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-200">Qty: {i.quantity}</div>
            </div>
            <div>${Number(i.products?.price ?? 0).toFixed(2)}</div>
          </div>
        ))}
      </div>
      <div className="text-right font-semibold">Subtotal: ${subtotal.toFixed(2)}</div>
      <a href="/checkout" className="btn btn-primary w-max">Proceed to checkout</a>
    </section>
  );
}