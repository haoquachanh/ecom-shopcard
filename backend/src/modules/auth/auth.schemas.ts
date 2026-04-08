import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Password must include letters and numbers'),
  name: z.string().min(1).max(120).optional(),
  phone: z.string().min(6).max(30).optional(),
  address: z.string().min(3).max(1000).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(10),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
