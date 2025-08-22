import { z } from 'zod';

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  value: z.string().min(1),
  stock_quantity: z.number().int().min(0).default(0),
  price_delta: z.number().min(0).default(0),
});

export const productCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  price: z.number().min(0),
  category_id: z.string().uuid(),
  images: z.array(z.string().url()).default([]),
  is_active: z.boolean().default(true),
  featured: z.boolean().default(false),
  stock_quantity: z.number().int().min(0).default(0),
  variants: z.array(productVariantSchema).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;