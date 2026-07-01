import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

const testUser = {
    name: 'Task Test',
    email: 'task.test@example.com',
    password: 'JunoTest123!',
}

const deleteTestUser = async () => {
    await prisma.user.deleteMany({
        where: {
            email: testUser.email,
        },
    })
}

const createAuthenticatedAgent = async () => {
    const agent = request.agent(app)
    const response = await agent
        .post('/api/v1/auth/register')
        .send(testUser)

    expect(response.status).toBe(201)

    return agent
}

beforeEach(deleteTestUser)

afterAll(async () => {
    await deleteTestUser()
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
