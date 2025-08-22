'use server';

import { revalidatePath } from 'next/cache';
import { callApi } from '../lib/express';

export async function addToCart(input: { product_id: string; variant_id?: string | null; quantity: number }) {
  await callApi('/cart', {
    method: 'POST',
    body: JSON.stringify({ ...input, guest_token: null }),
  });
  revalidatePath('/cart');
}

export async function updateCartItem(itemId: string, quantity: number) {
  await callApi(`/cart/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
  revalidatePath('/cart');
}

export async function removeCartItem(itemId: string) {
  await callApi(`/cart/${itemId}`, { method: 'DELETE' });
  revalidatePath('/cart');
}

export async function placeOrder(form: FormData) {
  const payload = {
    full_name: String(form.get('full_name') ?? ''),
    country: String(form.get('country') ?? ''),
    city: String(form.get('city') ?? ''),
    email: String(form.get('email') ?? ''),
    zip_code: String(form.get('zip_code') ?? ''),
    items: JSON.parse(String(form.get('items') ?? '[]')),
  };
  const resp = await callApi('/orders', { method: 'POST', body: JSON.stringify(payload) });
  return resp.data;
}