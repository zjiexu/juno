import { app } from './app.js'
import { env } from './config/env.js'
import { logger } from './lib/logger.js'
import { prisma } from './lib/prisma.js'

const startServer = async () => {
    await prisma.$connect()

    app.listen(env.PORT, () => {
        logger.info(
            {
                port: env.PORT,
                environment: env.NODE_ENV,
            },
            'Juno API started',
        )
    })
}

void startServer().catch((error: unknown) => {
    logger.fatal({ err: error }, 'Failed to start Juno API')
    process.exit(1)
})
