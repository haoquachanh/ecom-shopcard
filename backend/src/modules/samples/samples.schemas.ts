import { z } from 'zod';

export const samplesQuerySchema = z.object({
  product_type_id: z.coerce.number().int().positive().optional(),
});

export type SamplesQueryInput = z.infer<typeof samplesQuerySchema>;
