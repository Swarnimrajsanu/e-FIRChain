import { z } from 'zod';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'CITIZEN' | 'POLICE' | 'ADMIN';
}

interface LoginInput {
  email: string;
  password: string;
}

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, 'Password must contain at least one letter and one number'),
    phone: z.string().optional().refine((val) => !val || /^\+?[\d\s-]{8,20}$/.test(val), {
      message: 'Invalid phone number format',
    }),
    role: z.enum(['CITIZEN', 'POLICE', 'ADMIN']).optional().default('CITIZEN'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export { loginSchema, registerSchema };
export type { LoginInput, RegisterInput };
