import { Navigate, Outlet } from 'react-router'

import { ApiError } from '../lib/api'
import { useCurrentUser } from '../features/auth/auth.queries'

function SessionLoadingScreen() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
            <p>Loading Juno...</p>
        </main>
    )
}

export function ProtectedRoute() {
    const currentUserQuery = useCurrentUser()

    if (currentUserQuery.isPending) {
        return <SessionLoadingScreen />
    }

    const isUnauthorized =
        currentUserQuery.error instanceof ApiError &&
        currentUserQuery.error.status === 401

    if (currentUserQuery.isError && !isUnauthorized) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
                <div className="text-center">
                    <h1 className="text-xl font-semibold">
                        Unable to load your session
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Check your connection and try again.
                    </p>

                    <button
                        className="mt-6 rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950"
                        type="button"
                        onClick={() => void currentUserQuery.refetch()}
                    >
                        Try again
                    </button>
                </div>
            </main>
        )
    }

    if (!currentUserQuery.data) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export function PublicOnlyRoute() {
    const currentUserQuery = useCurrentUser()

    if (currentUserQuery.isPending) {
        return <SessionLoadingScreen />
    }

    if (currentUserQuery.data) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
