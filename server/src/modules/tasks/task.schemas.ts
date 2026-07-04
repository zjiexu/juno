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

export const taskParamsSchema = z
    .object({
        taskId: z.uuid('Task ID must be a valid UUID'),
    })
    .strict()

export const updateTaskInputSchema = createTaskInputSchema.partial()

export type TaskParams = z.infer<typeof taskParamsSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>

export const listTasksQuerySchema = z
    .object({
        search: z
            .string()
            .trim()
            .max(200, 'Search must be 200 characters or fewer')
            .optional(),
        status: taskStatusSchema.optional(),
        priority: taskPrioritySchema.optional(),
        sortBy: z
            .enum([
                'createdAt',
                'updatedAt',
                'dueDate',
                'title',
                'status',
                'priority',
            ])
            .default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .strict()

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>
