import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    CLIENT_ORIGIN: z.url().default('http://localhost:5173'),
    LOG_LEVEL: z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
        .default('info'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
    console.error(
        'Invalid environment variables:',
        z.flattenError(parsedEnv.error),
    )
    process.exit(1)
}

export const env = parsedEnv.data
