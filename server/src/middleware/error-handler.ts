import type { ErrorRequestHandler } from 'express'
import { AppError } from '../errors/app-error.js'
import { logger } from '../lib/logger.js'

export const errorHandler: ErrorRequestHandler = (
    error,
    request,
    response,
    _next,
) => {
    if (error instanceof AppError) {
        response.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message,
                ...(error.details === undefined
                    ? {}
                    : { details: error.details }),
            },
        })
        return
    }

    logger.error(
        {
            err: error,
            method: request.method,
            path: request.originalUrl,
        },
        'Unhandled request error',
    )

    response.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
        },
    })
}
