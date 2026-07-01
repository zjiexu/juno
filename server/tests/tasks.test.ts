import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

const testUser = {
    name: 'Task Test',
    email: 'task.test@example.com',
    password: 'JunoTest123!',
}

const otherTestUser = {
    name: 'Other Task Test',
    email: 'other.task.test@example.com',
    password: 'JunoTest123!',
}

const deleteTestUsers = async () => {
    await prisma.user.deleteMany({
        where: {
            email: {
                in: [
                    testUser.email,
                    otherTestUser.email,
                ],
            },
        },
    })
}

const createAuthenticatedAgent = async (user = testUser) => {
    const agent = request.agent(app)
    const response = await agent
        .post('/api/v1/auth/register')
        .send(user)

    expect(response.status).toBe(201)

    return agent
}

beforeEach(deleteTestUsers)

afterAll(async () => {
    await deleteTestUsers()
    await prisma.$disconnect()
})

describe('POST /api/v1/tasks', () => {
    it('creates a task for the authenticated user', async () => {
        const agent = await createAuthenticatedAgent()

        const response = await agent.post('/api/v1/tasks').send({
            title: 'Build the task API',
            description: 'Implement the create endpoint',
            status: 'in_progress',
            priority: 'high',
            dueDate: '2026-07-15',
        })

        expect(response.status).toBe(201)
        expect(response.body.data.task).toMatchObject({
            title: 'Build the task API',
            description: 'Implement the create endpoint',
            status: 'in_progress',
            priority: 'high',
            dueDate: '2026-07-15T00:00:00.000Z',
        })

        const storedTask = await prisma.task.findUnique({
            where: {
                id: response.body.data.task.id,
            },
            include: {
                user: true,
            },
        })

        expect(storedTask).not.toBeNull()
        expect(storedTask?.user.email).toBe(testUser.email)
    })

    it('uses default values for optional fields', async () => {
        const agent = await createAuthenticatedAgent()

        const response = await agent.post('/api/v1/tasks').send({
            title: 'Task with defaults',
        })

        expect(response.status).toBe(201)
        expect(response.body.data.task).toMatchObject({
            title: 'Task with defaults',
            description: null,
            status: 'todo',
            priority: 'medium',
            dueDate: null,
        })
    })

    it('rejects invalid task data', async () => {
        const agent = await createAuthenticatedAgent()

        const response = await agent.post('/api/v1/tasks').send({
            title: ' ',
            status: 'started',
            dueDate: '2026-02-30',
        })

        expect(response.status).toBe(400)
        expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('rejects an unauthenticated request', async () => {
        const response = await request(app).post('/api/v1/tasks').send({
            title: 'Unauthorized task',
        })

        expect(response.status).toBe(401)
        expect(response.body.error.code).toBe('UNAUTHENTICATED')
    })
})

describe('GET /api/v1/tasks', () => {
    it('returns only the current user tasks with sorting and pagination', async () => {
        const agent = await createAuthenticatedAgent()
        const otherAgent = await createAuthenticatedAgent(otherTestUser)

        for (const title of [
            'Gamma task',
            'Alpha task',
            'Beta task',
        ]) {
            await agent.post('/api/v1/tasks').send({
                title,
            })
        }

        await otherAgent.post('/api/v1/tasks').send({
            title: 'Private task',
        })

        const response = await agent
            .get('/api/v1/tasks')
            .query({
                sortBy: 'title',
                sortOrder: 'asc',
                page: 1,
                limit: 2,
            })

        expect(response.status).toBe(200)
        expect(
            response.body.data.tasks.map(
                (task: { title: string }) => task.title,
            ),
        ).toEqual([
            'Alpha task',
            'Beta task',
        ])
        expect(response.body.meta).toEqual({
            page: 1,
            limit: 2,
            total: 3,
            totalPages: 2,
        })
    })

    it('searches and filters the current user tasks', async () => {
        const agent = await createAuthenticatedAgent()

        await agent.post('/api/v1/tasks').send({
            title: 'Write API docs',
            description: 'Authentication guide',
            status: 'done',
            priority: 'high',
        })

        await agent.post('/api/v1/tasks').send({
            title: 'Fix dashboard',
            description: 'Update charts',
            status: 'todo',
            priority: 'low',
        })

        const response = await agent
            .get('/api/v1/tasks')
            .query({
                search: 'authentication',
                status: 'done',
                priority: 'high',
            })

        expect(response.status).toBe(200)
        expect(response.body.data.tasks).toHaveLength(1)
        expect(response.body.data.tasks[0]).toMatchObject({
            title: 'Write API docs',
            status: 'done',
            priority: 'high',
        })
    })

    it('rejects invalid query parameters', async () => {
        const agent = await createAuthenticatedAgent()

        const response = await agent
            .get('/api/v1/tasks')
            .query({
                status: 'started',
                limit: 101,
            })

        expect(response.status).toBe(400)
        expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('rejects an unauthenticated request', async () => {
        const response = await request(app).get('/api/v1/tasks')

        expect(response.status).toBe(401)
        expect(response.body.error.code).toBe('UNAUTHENTICATED')
    })
})
