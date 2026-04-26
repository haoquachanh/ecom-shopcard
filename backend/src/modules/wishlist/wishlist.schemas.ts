import { z } from 'zod';

export const addWishlistSchema = z.object({
  product_type_id: z.coerce.number().int().positive(),
});

export type AddWishlistInput = z.infer<typeof addWishlistSchema>;
