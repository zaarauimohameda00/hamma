export const runtime = 'nodejs';

import { callApi } from '../../../../../lib/express';

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
	const { orderId } = await params;
	const { data: order } = await callApi(`/orders/${orderId}`);
	return (
		<section className="p-4 grid gap-4">
			<h1 className="text-2xl font-bold">Thank you for your order!</h1>
			<div className="rounded-2xl border border-gray-200 dark:border-gray-600 p-4">
				<div className="font-medium">Order #{orderId.slice(0, 8)}</div>
				<div className="text-sm text-gray-600 dark:text-gray-200">Total: ${Number(order.total).toFixed(2)}</div>
			</div>
			<a className="btn btn-secondary w-max" href={`/api/express-proxy?path=/orders/${orderId}/invoice`}>Download Invoice (PDF)</a>
		</section>
	);
}