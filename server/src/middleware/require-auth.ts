import type { RequestHandler } from 'express'
import { AppError } from '../errors/app-error.js'
import { verifyAuthToken } from '../lib/auth-token.js'
import { AUTH_COOKIE_NAME } from '../modules/auth/auth-cookie.js'

const authenticationRequired = () =>
    new AppError(401, 'UNAUTHENTICATED', 'Authentication required')

export const requireAuth: RequestHandler = async (
    request,
    _response,
    next,
) => {
    const token = request.cookies?.[AUTH_COOKIE_NAME] as unknown

    if (typeof token !== 'string') {
        next(authenticationRequired())
        return
    }

    try {
        const userId = await verifyAuthToken(token)
        request.auth = {
            userId,
        }
        next()
    } catch {
        next(authenticationRequired())
    }
}
