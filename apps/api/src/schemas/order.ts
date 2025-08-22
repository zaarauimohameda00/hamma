import { z } from 'zod';

export const checkoutItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1),
});

export const checkoutSchema = z.object({
  full_name: z.string().min(2),
  country: z.string().min(2),
  city: z.string().min(1),
  email: z.string().email(),
  zip_code: z.string().min(2),
  items: z.array(checkoutItemSchema).min(1),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded']),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;