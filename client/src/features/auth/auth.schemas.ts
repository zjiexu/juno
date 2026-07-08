import { z } from 'zod'

export const loginFormSchema = z.object({
    email: z.email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
})

export const registerFormSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, 'Name is required')
            .max(100, 'Name must be 100 characters or fewer'),
        email: z.email('Please enter a valid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must be 128 characters or fewer'),
        confirmPassword: z.string(),
    })
    .refine(
        (values) => values.password === values.confirmPassword,
        {
            message: 'Passwords do not match',
            path: ['confirmPassword'],
        },
    )

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>
