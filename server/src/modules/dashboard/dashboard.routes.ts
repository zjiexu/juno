import { Router } from 'express'
import { AppError } from '../../errors/app-error.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../middleware/require-auth.js'

export const dashboardRouter = Router()

dashboardRouter.use(requireAuth)

dashboardRouter.get('/', async (request, response) => {
    const userId = request.auth?.userId

    if (!userId) {
        throw new AppError(
            401,
            'UNAUTHENTICATED',
            'Authentication required',
        )
    }

    const [statusGroups, recentTasks] = await prisma.$transaction([
        prisma.task.groupBy({
            by: ['status'],
            where: {
                userId,
            },
            _count: {
                _all: true,
            },
        }),
        prisma.task.findMany({
            where: {
                userId,
            },
            orderBy: [
                {
                    createdAt: 'desc',
                },
                {
                    id: 'asc',
                },
            ],
            take: 5,
        }),
    ])

    const statusCounts = new Map(
        statusGroups.map((group) => [
            group.status,
            group._count._all,
        ]),
    )

    const todo = statusCounts.get('todo') ?? 0
    const inProgress = statusCounts.get('in_progress') ?? 0
    const done = statusCounts.get('done') ?? 0
    const total = todo + inProgress + done
    const completionPercentage =
        total === 0
            ? 0
            : Math.round((done / total) * 100)

    response.status(200).json({
        data: {
            statistics: {
                total,
                todo,
                inProgress,
                done,
                completionPercentage,
            },
            recentTasks,
        },
    })
})
