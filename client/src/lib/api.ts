interface ApiErrorBody {
    error?: {
        code?: string
        message?: string
        details?: unknown
    }
}

export class ApiError extends Error {
    readonly status: number
    readonly code: string
    readonly details?: unknown

    constructor(
        status: number,
        code: string,
        message: string,
        details?: unknown,
    ) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.details = details
    }
}

const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

if (!apiUrl) {
    throw new Error('VITE_API_URL is required')
}

export const apiRequest = async <T>(
    path: string,
    options: RequestInit = {},
): Promise<T> => {
    const headers = new Headers(options.headers)

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers,
        credentials: 'include',
    })

    if (response.status === 204) {
        return undefined as T
    }

    const body: unknown = await response.json()

    if (!response.ok) {
        const errorBody = body as ApiErrorBody

        throw new ApiError(
            response.status,
            errorBody.error?.code ?? 'REQUEST_FAILED',
            errorBody.error?.message ?? 'Request failed',
            errorBody.error?.details,
        )
    }

    return body as T
}
