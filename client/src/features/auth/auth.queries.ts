import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
} from './auth.api'

export const currentUserQueryKey = ['auth', 'current-user'] as const

export const useCurrentUser = () =>
    useQuery({
        queryKey: currentUserQueryKey,
        queryFn: async () => {
            const response = await getCurrentUser()
            return response.data.user
        },
    })

export const useLogin = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (response) => {
            queryClient.setQueryData(
                currentUserQueryKey,
                response.data.user,
            )
        },
    })
}

export const useRegister = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: registerUser,
        onSuccess: (response) => {
            queryClient.setQueryData(
                currentUserQueryKey,
                response.data.user,
            )
        },
    })
}

export const useLogout = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            queryClient.removeQueries({
                queryKey: currentUserQueryKey,
            })
        },
    })
}
