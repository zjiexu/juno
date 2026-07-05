import { apiRequest } from '../../lib/api'
import type { AuthResponse } from '../../types/api'

export interface RegisterInput {
    name: string
    email: string
    password: string
}

export interface LoginInput {
    email: string
    password: string
}

export const registerUser = (input: RegisterInput) =>
    apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
    })

export const loginUser = (input: LoginInput) =>
    apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
    })

export const getCurrentUser = () =>
    apiRequest<AuthResponse>('/auth/me')

export const logoutUser = () =>
    apiRequest<void>('/auth/logout', {
        method: 'POST',
    })
