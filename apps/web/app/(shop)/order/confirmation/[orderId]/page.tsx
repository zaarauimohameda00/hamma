export const runtime = 'nodejs';

export default async function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold">Order Confirmation</h1>
      <p>Order ID: {params.orderId}</p>
      <a className="btn btn-secondary" href={`/api/orders/${params.orderId}/invoice`}>
        Download invoice
      </a>
    </section>
  );
}