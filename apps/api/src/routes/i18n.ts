import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase';

export const i18nRouter = Router();

i18nRouter.get('/namespaces', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('i18n_namespaces').select('*').order('name');
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

i18nRouter.get('/translations', async (req, res, next) => {
  try {
    const schema = z.object({ lang: z.enum(['en', 'ar', 'es']), ns: z.string().optional() });
    const params = schema.parse(req.query);

    let builder = supabaseAdmin
      .from('i18n_translations')
      .select('lang, key, value, i18n_namespaces(name)')
      .eq('lang', params.lang);

    if (params.ns) {
      const { data: ns } = await supabaseAdmin
        .from('i18n_namespaces')
        .select('id')
        .eq('name', params.ns)
        .single();
      if (ns) builder = builder.eq('namespace_id', ns.id);
    }

    const { data, error } = await builder;
    if (error) throw error;

    const grouped: Record<string, Record<string, string>> = {};
    for (const row of data) {
      const ns = (row as any).i18n_namespaces.name as string;
      grouped[ns] = grouped[ns] || {};
      grouped[ns][row.key] = row.value;
    }

    res.json({ data: grouped });
  } catch (err) {
    next(err);
  }
});