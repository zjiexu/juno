import path from 'node:path'
import { config } from 'dotenv'
import { z } from 'zod'

config({
    path: path.resolve(import.meta.dirname, '../../../.env'),
})

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    CLIENT_ORIGIN: z.url().default('http://localhost:5173'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z
        .string()
        .min(32, 'JWT_SECRET must be at least 32 characters'),
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
