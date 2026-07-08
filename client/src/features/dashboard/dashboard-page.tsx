import { useNavigate } from 'react-router'

import {
    useCurrentUser,
    useLogout,
} from '../auth/auth.queries'

export function DashboardPage() {
    const navigate = useNavigate()
    const currentUserQuery = useCurrentUser()
    const logoutMutation = useLogout()
    const user = currentUserQuery.data

    const handleLogout = () => {
        logoutMutation.mutate(undefined, {
            onSuccess: () => {
                navigate('/login', { replace: true })
            },
        })
    }

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
            <div className="mx-auto max-w-5xl">
                <header className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div>
                        <p className="text-xl font-semibold">
                            Juno
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                            Task management workspace
                        </p>
                    </div>

                    <button
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        disabled={logoutMutation.isPending}
                        onClick={handleLogout}
                    >
                        {logoutMutation.isPending
                            ? 'Logging out...'
                            : 'Log out'}
                    </button>
                </header>

                <section className="py-16">
                    <p className="text-sm font-medium text-cyan-300">
                        Dashboard
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                        Welcome, {user?.name}
                    </h1>

                    <p className="mt-4 max-w-2xl text-lg text-slate-400">
                        Your authenticated workspace is ready. Dashboard statistics and task management are coming next.
                    </p>

                    <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
                        <p className="text-sm text-slate-400">
                            Signed in as
                        </p>

                        <p className="mt-2 font-medium">
                            {user?.email}
                        </p>
                    </div>
                </section>
            </div>
        </main>
    )
}
