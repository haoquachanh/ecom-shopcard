import { z } from 'zod';

export const calculatePriceSchema = z.object({
  product_type_id: z.coerce.number().int().positive(),
  sample_id: z.coerce.number().int().positive(),
  material_id: z.coerce.number().int().positive(),
  size_id: z.coerce.number().int().positive(),
  side_id: z.coerce.number().int().positive(),
  effect_id: z.coerce.number().int().positive().nullable().optional(),
  quantity: z.coerce.number().int().min(1),
});

export type CalculatePriceInput = z.infer<typeof calculatePriceSchema>;
