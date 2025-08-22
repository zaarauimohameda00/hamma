import { callApi } from '../../../lib/express';
import { placeOrder } from '../../actions';

export const runtime = 'nodejs';

export default async function CheckoutPage() {
  const { data } = await callApi('/cart');
  const items = (data as any[]).map(i => ({ product_id: i.product_id, variant_id: i.variant_id, quantity: i.quantity }));
  const jsonItems = JSON.stringify(items);

  return (
    <section className="p-4 grid gap-4">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <form action={async (formData) => {
        'use server';
        formData.set('items', jsonItems);
        const order = await placeOrder(formData);
        return { redirect: `/order/confirmation/${order.id}` };
      }} className="grid gap-3 max-w-md">
        <input className="input" name="full_name" placeholder="Full Name" required />
        <input className="input" name="country" placeholder="Country" required />
        <input className="input" name="city" placeholder="City" required />
        <input className="input" name="email" placeholder="Email" type="email" required />
        <input className="input" name="zip_code" placeholder="Zip Code" required />
        <button className="btn btn-primary" type="submit">Pay</button>
      </form>
    </section>
  );
}