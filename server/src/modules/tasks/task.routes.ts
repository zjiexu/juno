import { Router, type Request } from 'express'
import { z } from 'zod'
import { AppError } from '../../errors/app-error.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../middleware/require-auth.js'
import { createTaskInputSchema } from './task.schemas.js'

export const taskRouter = Router()

taskRouter.use(requireAuth)

const getAuthenticatedUserId = (request: Request) => {
    const userId = request.auth?.userId

    if (!userId) {
        throw new AppError(
            401,
            'UNAUTHENTICATED',
            'Authentication required',
        )
    }

    return userId
}

taskRouter.post('/', async (request, response) => {
    const parsedInput = createTaskInputSchema.safeParse(request.body)

    if (!parsedInput.success) {
        throw new AppError(
            400,
            'VALIDATION_ERROR',
            'Invalid task data',
            z.flattenError(parsedInput.error).fieldErrors,
        )
    }

    const userId = getAuthenticatedUserId(request)
    const {
        title,
        description,
        status,
        priority,
        dueDate,
    } = parsedInput.data

    const task = await prisma.task.create({
        data: {
            userId,
            title,
            description: description ?? null,
            status: status ?? 'todo',
            priority: priority ?? 'medium',
            dueDate:
                dueDate === null || dueDate === undefined
                    ? null
                    : new Date(`${dueDate}T00:00:00.000Z`),
        },
    })

    response.status(201).json({
        data: {
            task,
        },
    })
})
