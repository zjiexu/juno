import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

const testUser = {
    name: 'Dashboard Test',
    email: 'dashboard.test@example.com',
    password: 'JunoTest123!',
}

const otherTestUser = {
    name: 'Other Dashboard Test',
    email: 'other.dashboard.test@example.com',
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

describe('GET /api/v1/dashboard', () => {
    it('returns zero statistics when the user has no tasks', async () => {
        const agent = await createAuthenticatedAgent()
        const response = await agent.get('/api/v1/dashboard')

        expect(response.status).toBe(200)
        expect(response.body.data.statistics).toEqual({
            total: 0,
            todo: 0,
            inProgress: 0,
            done: 0,
            completionPercentage: 0,
        })
        expect(response.body.data.recentTasks).toEqual([])
    })

    it('calculates statistics only from the current user tasks', async () => {
        const agent = await createAuthenticatedAgent()
        const otherAgent = await createAuthenticatedAgent(otherTestUser)

        for (const [index, status] of [
            'todo',
            'todo',
            'in_progress',
            'done',
            'done',
            'done',
        ].entries()) {
            await agent.post('/api/v1/tasks').send({
                title: `Dashboard task ${index + 1}`,
                status,
            })
        }

        await otherAgent.post('/api/v1/tasks').send({
            title: 'Other user dashboard task',
            status: 'done',
        })

        const response = await agent.get('/api/v1/dashboard')

        expect(response.status).toBe(200)
        expect(response.body.data.statistics).toEqual({
            total: 6,
            todo: 2,
            inProgress: 1,
            done: 3,
            completionPercentage: 50,
        })

        const recentTasks = response.body.data.recentTasks

        expect(recentTasks).toHaveLength(5)
        expect(
            recentTasks.map(
                (task: { title: string }) => task.title,
            ),
        ).not.toContain('Other user dashboard task')
    })

    it('rejects an unauthenticated request', async () => {
        const response = await request(app).get('/api/v1/dashboard')

        expect(response.status).toBe(401)
        expect(response.body.error.code).toBe('UNAUTHENTICATED')
    })
})
