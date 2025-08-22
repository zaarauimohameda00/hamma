import { Router } from 'express';
import { supabaseAdmin } from '../supabase';
import { z } from 'zod';

export const analyticsRouter = Router();

const rangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

analyticsRouter.get('/sales-overview', async (req, res, next) => {
  try {
    rangeSchema.parse(req.query);
    const { data, error } = await supabaseAdmin.rpc('get_sales_overview', req.query as any);
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/best-selling', async (req, res, next) => {
  try {
    rangeSchema.parse(req.query);
    const { data, error } = await supabaseAdmin.rpc('get_best_selling_products', req.query as any);
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/orders-by-category', async (req, res, next) => {
  try {
    rangeSchema.parse(req.query);
    const { data, error } = await supabaseAdmin.rpc('get_orders_by_category', req.query as any);
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});