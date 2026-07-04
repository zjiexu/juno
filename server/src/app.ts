import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'
import { env } from './config/env.js'
import { logger } from './lib/logger.js'
import { errorHandler } from './middleware/error-handler.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js'
import { taskRouter } from './modules/tasks/task.routes.js'

export const app = express()

app.disable('x-powered-by')

app.use(pinoHttp({ logger }))
app.use(helmet())
app.use(
    cors({
        origin: env.CLIENT_ORIGIN,
        credentials: true,
    }),
)
app.use(express.json())
app.use(cookieParser())
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/dashboard', dashboardRouter)
app.use('/api/v1/tasks', taskRouter)

app.get('/api/v1/health', (_request, response) => {
    response.status(200).json({
        status: 'ok',
        service: 'juno-api',
    })
})

app.use((_request, response) => {
    response.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found',
        },
    })
})

app.use(errorHandler)
