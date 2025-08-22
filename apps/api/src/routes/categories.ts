import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase';
import { categoryCreateSchema, categoryUpdateSchema } from '../schemas/category';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const categoriesRouter = Router();

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = categoryCreateSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.from('categories').insert(body).select('*').single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const body = categoryUpdateSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.from('categories').update(body).eq('id', id).select('*').single();
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

categoriesRouter.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});