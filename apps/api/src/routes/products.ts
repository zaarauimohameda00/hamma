import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase';
import { productCreateSchema, productUpdateSchema } from '../schemas/product';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { parsePagination, parseSort } from '../utils/pagination';

export const productsRouter = Router();

const listQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().uuid().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

productsRouter.get('/', async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const { from, to } = parsePagination(query);
    const { column, ascending } = parseSort(query, ['created_at', 'price', 'popularity'], 'created_at:desc');

    let builder = supabaseAdmin
      .from('products')
      .select('*, categories(name, slug)', { count: 'exact' })
      .eq('is_active', true)
      .order(column, { ascending })
      .range(from, to);

    if (query.q) {
      builder = builder.or(`name.ilike.%${query.q}%,description.ilike.%${query.q}%`);
    }
    if (query.category) {
      builder = builder.eq('category_id', query.category);
    }
    if (query.minPrice !== undefined) {
      builder = builder.gte('price', query.minPrice);
    }
    if (query.maxPrice !== undefined) {
      builder = builder.lte('price', query.maxPrice);
    }

    const { data, error, count } = await builder;
    if (error) throw error;
    res.json({ data, count });
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, product_variants(*), categories(name, slug)')
      .eq('id', id)
      .single();
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

productsRouter.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = productCreateSchema.parse(req.body);
    const { variants, ...product } = body;
    const { data, error } = await supabaseAdmin.from('products').insert(product).select('*').single();
    if (error) throw error;

    if (variants?.length) {
      const withProductId = variants.map(v => ({ ...v, product_id: data.id }));
      const { error: vErr } = await supabaseAdmin.from('product_variants').insert(withProductId);
      if (vErr) throw vErr;
    }

    const { data: full } = await supabaseAdmin
      .from('products')
      .select('*, product_variants(*)')
      .eq('id', data.id)
      .single();

    res.status(201).json({ data: full });
  } catch (err) {
    next(err);
  }
});

productsRouter.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const body = productUpdateSchema.parse(req.body);
    const { variants, ...product } = body;
    const { data, error } = await supabaseAdmin.from('products').update(product).eq('id', id).select('*').single();
    if (error) throw error;

    if (variants) {
      // Simple strategy: delete existing then insert new
      const { error: delErr } = await supabaseAdmin.from('product_variants').delete().eq('product_id', id);
      if (delErr) throw delErr;
      if (variants.length) {
        const withProductId = variants.map(v => ({ ...v, product_id: id }));
        const { error: insErr } = await supabaseAdmin.from('product_variants').insert(withProductId);
        if (insErr) throw insErr;
      }
    }

    const { data: full } = await supabaseAdmin
      .from('products')
      .select('*, product_variants(*)')
      .eq('id', data.id)
      .single();

    res.json({ data: full });
  } catch (err) {
    next(err);
  }
});

productsRouter.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});