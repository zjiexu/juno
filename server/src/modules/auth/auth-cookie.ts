import type { CookieOptions, Response } from 'express'
import { env } from '../../config/env.js'
import { AUTH_TOKEN_TTL_SECONDS } from '../../lib/auth-token.js'

export const AUTH_COOKIE_NAME = 'juno_session'

const authCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
} satisfies CookieOptions

export const setAuthCookie = (response: Response, token: string) => {
    response.cookie(AUTH_COOKIE_NAME, token, {
        ...authCookieOptions,
        maxAge: AUTH_TOKEN_TTL_SECONDS * 1000,
    })
}

export const clearAuthCookie = (response: Response) => {
    response.clearCookie(AUTH_COOKIE_NAME, authCookieOptions)
}
