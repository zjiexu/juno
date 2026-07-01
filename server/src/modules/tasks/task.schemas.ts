import { z } from 'zod'

export const taskStatusSchema = z.enum([
    'todo',
    'in_progress',
    'done',
])

export const taskPrioritySchema = z.enum([
    'low',
    'medium',
    'high',
])

export const createTaskInputSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(1, 'Title is required')
            .max(200, 'Title must be 200 characters or fewer'),
        description: z
            .string()
            .trim()
            .max(5000, 'Description must be 5000 characters or fewer')
            .nullable()
            .optional(),
        status: taskStatusSchema.optional(),
        priority: taskPrioritySchema.optional(),
        dueDate: z.iso.date().nullable().optional(),
    })
    .strict()

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>
