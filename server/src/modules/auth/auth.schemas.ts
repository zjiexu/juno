import { z } from 'zod'

export const registerInputSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, 'Name is required')
            .max(100, 'Name must be 100 characters or fewer'),
        email: z
            .string()
            .trim()
            .toLowerCase()
            .max(255, 'Email must be 255 characters or fewer')
            .pipe(z.email('Please enter a valid email address')),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must be 128 characters or fewer'),
    })
    .strict()

export type RegisterInput = z.infer<typeof registerInputSchema>
