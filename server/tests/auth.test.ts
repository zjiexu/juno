import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

const testUser = {
    name: 'Registration Test',
    email: 'registration.test@example.com',
    password: 'JunoTest123!',
}

const deleteTestUser = async () => {
    await prisma.user.deleteMany({
        where: {
            email: testUser.email,
        },
    })
}

beforeEach(deleteTestUser)

afterAll(async () => {
    await deleteTestUser()
    await prisma.$disconnect()
})

describe('POST /api/v1/auth/register', () => {
    it('creates a user and sets an authentication cookie', async () => {
        const response = await request(app)
            .post('/api/v1/auth/register')
            .send(testUser)

        expect(response.status).toBe(201)
        expect(response.body.data.user).toMatchObject({
            name: testUser.name,
            email: testUser.email,
        })
        expect(response.body.data.user).not.toHaveProperty('passwordHash')

        const setCookieHeader = String(response.headers['set-cookie'])

        expect(setCookieHeader).toContain('juno_session=')
        expect(setCookieHeader).toContain('HttpOnly')
        expect(setCookieHeader).toContain('SameSite=Lax')

        const storedUser = await prisma.user.findUnique({
            where: {
                email: testUser.email,
            },
        })

        expect(storedUser).not.toBeNull()
        expect(storedUser?.passwordHash).not.toBe(testUser.password)
        expect(storedUser?.passwordHash.startsWith('$argon2id$')).toBe(true)
    })

    it('rejects invalid registration data', async () => {
        const response = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: ' ',
                email: 'not-an-email',
                password: 'short',
            })

        expect(response.status).toBe(400)
        expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('rejects an email that is already registered', async () => {
        await request(app).post('/api/v1/auth/register').send(testUser)

        const response = await request(app)
            .post('/api/v1/auth/register')
            .send(testUser)

        expect(response.status).toBe(409)
        expect(response.body.error.code).toBe('EMAIL_ALREADY_IN_USE')
    })
})

describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
        await request(app).post('/api/v1/auth/register').send(testUser)
    })

    it('logs in with valid credentials', async () => {
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: ` ${testUser.email.toUpperCase()} `,
                password: testUser.password,
            })

        expect(response.status).toBe(200)
        expect(response.body.data.user).toMatchObject({
            name: testUser.name,
            email: testUser.email,
        })
        expect(response.body.data.user).not.toHaveProperty('passwordHash')

        const setCookieHeader = String(response.headers['set-cookie'])

        expect(setCookieHeader).toContain('juno_session=')
        expect(setCookieHeader).toContain('HttpOnly')
    })

    it('rejects an incorrect password', async () => {
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: testUser.email,
                password: 'IncorrectPassword123!',
            })

        expect(response.status).toBe(401)
        expect(response.body.error).toEqual({
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
        })
    })

    it('rejects an unknown email with the same error', async () => {
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'unknown@example.com',
                password: testUser.password,
            })

        expect(response.status).toBe(401)
        expect(response.body.error).toEqual({
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
        })
    })
})

describe('POST /api/v1/auth/logout', () => {
    it('clears the authentication cookie', async () => {
        const response = await request(app)
            .post('/api/v1/auth/logout')
            .set('Cookie', 'juno_session=test-token')

        expect(response.status).toBe(204)

        const setCookieHeader = String(response.headers['set-cookie'])

        expect(setCookieHeader).toContain('juno_session=;')
        expect(setCookieHeader).toContain(
            'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        )
    })
})
