import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase';
import { requireAuth, requireAdmin } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.get('/', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

usersRouter.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const role = z.enum(['user', 'admin']).parse(req.body.role);
    const { data, error } = await supabaseAdmin.from('profiles').update({ role }).eq('id', id).select('*').single();
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});