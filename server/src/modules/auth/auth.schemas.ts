import { z } from 'zod'

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .max(255, 'Email must be 255 characters or fewer')
    .pipe(z.email('Please enter a valid email address'))

export const registerInputSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, 'Name is required')
            .max(100, 'Name must be 100 characters or fewer'),
        email: emailSchema,
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must be 128 characters or fewer'),
    })
    .strict()

export const loginInputSchema = z
    .object({
        email: emailSchema,
        password: z
            .string()
            .min(1, 'Password is required')
            .max(128, 'Password must be 128 characters or fewer'),
    })
    .strict()

export type RegisterInput = z.infer<typeof registerInputSchema>
export type LoginInput = z.infer<typeof loginInputSchema>
