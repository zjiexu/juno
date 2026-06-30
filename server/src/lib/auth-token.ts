import { jwtVerify, SignJWT } from 'jose'
import { env } from '../config/env.js'

const JWT_ALGORITHM = 'HS256'
const JWT_ISSUER = 'juno-api'
const JWT_AUDIENCE = 'juno-client'

export const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET)

export const signAuthToken = async (userId: string) =>
    new SignJWT()
        .setProtectedHeader({ alg: JWT_ALGORITHM })
        .setSubject(userId)
        .setIssuedAt()
        .setIssuer(JWT_ISSUER)
        .setAudience(JWT_AUDIENCE)
        .setExpirationTime(
            Math.floor(Date.now() / 1000) + AUTH_TOKEN_TTL_SECONDS,
        )
        .sign(jwtSecret)

export const verifyAuthToken = async (token: string) => {
    const { payload } = await jwtVerify(token, jwtSecret, {
        algorithms: [JWT_ALGORITHM],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
    })

    if (!payload.sub) {
        throw new Error('Authentication token is missing a subject')
    }

    return payload.sub
}
