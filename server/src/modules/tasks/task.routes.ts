import { Router, type Request } from 'express'
import { z } from 'zod'
import { AppError } from '../../errors/app-error.js'
import type { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../middleware/require-auth.js'
import {
    createTaskInputSchema,
    listTasksQuerySchema,
} from './task.schemas.js'

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

taskRouter.get('/', async (request, response) => {
    const parsedQuery = listTasksQuerySchema.safeParse(request.query)

    if (!parsedQuery.success) {
        throw new AppError(
            400,
            'VALIDATION_ERROR',
            'Invalid task query',
            z.flattenError(parsedQuery.error).fieldErrors,
        )
    }

    const userId = getAuthenticatedUserId(request)
    const {
        search,
        status,
        priority,
        sortBy,
        sortOrder,
        page,
        limit,
    } = parsedQuery.data

    const where: Prisma.TaskWhereInput = {
        userId,
    }

    if (status !== undefined) {
        where.status = status
    }

    if (priority !== undefined) {
        where.priority = priority
    }

    if (search) {
        where.OR = [
            {
                title: {
                    contains: search,
                    mode: 'insensitive',
                },
            },
            {
                description: {
                    contains: search,
                    mode: 'insensitive',
                },
            },
        ]
    }

    let primaryOrderBy: Prisma.TaskOrderByWithRelationInput

    if (sortBy === 'dueDate') {
        primaryOrderBy = {
            dueDate: {
                sort: sortOrder,
                nulls: 'last',
            },
        }
    } else {
        primaryOrderBy = {
            [sortBy]: sortOrder,
        }
    }

    const [tasks, total] = await prisma.$transaction([
        prisma.task.findMany({
            where,
            orderBy: [
                primaryOrderBy,
                {
                    id: 'asc',
                },
            ],
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.task.count({
            where,
        }),
    ])

    response.status(200).json({
        data: {
            tasks,
        },
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    })
})

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
