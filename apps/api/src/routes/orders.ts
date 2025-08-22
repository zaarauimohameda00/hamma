import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase';
import { requireAuth, type AuthRequest, requireAdmin } from '../middleware/auth';
import { checkoutSchema, orderStatusUpdateSchema } from '../schemas/order';

export const ordersRouter = Router();

ordersRouter.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, price)), profiles(full_name)')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

ordersRouter.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const input = checkoutSchema.parse(req.body);

    // Calculate totals on server-side
    const productIds = input.items.map(i => i.product_id);
    const { data: products, error: pErr } = await supabaseAdmin
      .from('products')
      .select('id, price')
      .in('id', productIds);
    if (pErr) throw pErr;

    const priceMap = new Map(products.map(p => [p.id, Number(p.price)]));
    let subtotal = 0;
    for (const item of input.items) {
      const price = priceMap.get(item.product_id) ?? 0;
      subtotal += price * item.quantity;
    }

    const { data: settings } = await supabaseAdmin.from('site_settings').select('*').eq('key', 'tax').single();
    const taxRate = Number(settings?.value?.rate ?? 0.1);
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = subtotal + tax;

    const { data: order, error: oErr } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: req.user!.id,
        full_name: input.full_name,
        country: input.country,
        city: input.city,
        email: input.email,
        zip_code: input.zip_code,
        subtotal,
        tax,
        total,
        status: 'pending',
      })
      .select('*')
      .single();
    if (oErr) throw oErr;

    const orderItems = input.items.map(i => ({
      order_id: order.id,
      product_id: i.product_id,
      variant_id: i.variant_id ?? null,
      quantity: i.quantity,
      unit_price: priceMap.get(i.product_id) ?? 0,
    }));
    const { error: oiErr } = await supabaseAdmin.from('order_items').insert(orderItems);
    if (oiErr) throw oiErr;

    res.status(201).json({ data: { ...order, items: orderItems } });
  } catch (err) {
    next(err);
  }
});

ordersRouter.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const body = orderStatusUpdateSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.from('orders').update({ status: body.status }).eq('id', id).select('*').single();
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});