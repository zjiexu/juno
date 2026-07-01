import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import { AppError } from '../../errors/app-error.js'
import { Prisma } from '../../generated/prisma/client.js'
import { signAuthToken } from '../../lib/auth-token.js'
import { hashPassword, verifyPassword } from '../../lib/password.js'
import { prisma } from '../../lib/prisma.js'
import { clearAuthCookie, setAuthCookie } from './auth-cookie.js'
import {
    loginInputSchema,
    registerInputSchema,
} from './auth.schemas.js'

export const authRouter = Router()

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts. Please try again later.',
        },
    },
})

authRouter.post('/register', authRateLimiter, async (request, response) => {
    const parsedInput = registerInputSchema.safeParse(request.body)

    if (!parsedInput.success) {
        throw new AppError(
            400,
            'VALIDATION_ERROR',
            'Invalid registration data',
            z.flattenError(parsedInput.error).fieldErrors,
        )
    }

    const { name, email, password } = parsedInput.data
    const passwordHash = await hashPassword(password)

    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        const token = await signAuthToken(user.id)
        setAuthCookie(response, token)

        response.status(201).json({
            data: {
                user,
            },
        })
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            throw new AppError(
                409,
                'EMAIL_ALREADY_IN_USE',
                'An account with this email already exists',
            )
        }

        throw error
    }
})

authRouter.post('/login', authRateLimiter, async (request, response) => {
    const parsedInput = loginInputSchema.safeParse(request.body)

    if (!parsedInput.success) {
        throw new AppError(
            400,
            'VALIDATION_ERROR',
            'Invalid login data',
            z.flattenError(parsedInput.error).fieldErrors,
        )
    }

    const { email, password } = parsedInput.data
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    })

    if (!user) {
        throw new AppError(
            401,
            'INVALID_CREDENTIALS',
            'Invalid email or password',
        )
    }

    const { passwordHash, ...authenticatedUser } = user
    const passwordIsValid = await verifyPassword(passwordHash, password)

    if (!passwordIsValid) {
        throw new AppError(
            401,
            'INVALID_CREDENTIALS',
            'Invalid email or password',
        )
    }

    const token = await signAuthToken(user.id)
    setAuthCookie(response, token)

    response.status(200).json({
        data: {
            user: authenticatedUser,
        },
    })
})

authRouter.post('/logout', (_request, response) => {
    clearAuthCookie(response)
    response.status(204).send()
})
