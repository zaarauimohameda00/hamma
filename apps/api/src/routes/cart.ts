import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase';
import { requireAuth, type AuthRequest } from '../middleware/auth';

export const cartRouter = Router();

const upsertSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1),
  guest_token: z.string().optional(),
});

cartRouter.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .select('*, products(name, price, images)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

cartRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const body = upsertSchema.parse(req.body);
    const userId = req.user?.id ?? null;

    const payload: any = {
      product_id: body.product_id,
      variant_id: body.variant_id ?? null,
      quantity: body.quantity,
      user_id: userId,
      guest_token: userId ? null : body.guest_token ?? null,
    };

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .upsert(payload, { onConflict: 'user_id,guest_token,product_id,variant_id' })
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

cartRouter.put('/:itemId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const itemId = z.string().uuid().parse(req.params.itemId);
    const quantity = z.number().int().min(1).parse(req.body.quantity);
    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .eq('user_id', req.user!.id)
      .select('*')
      .single();
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

cartRouter.delete('/:itemId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const itemId = z.string().uuid().parse(req.params.itemId);
    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', req.user!.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});