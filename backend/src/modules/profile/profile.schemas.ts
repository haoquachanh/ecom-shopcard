import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    phone: z.string().min(6).max(30).optional(),
    address: z.string().min(3).max(1000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
