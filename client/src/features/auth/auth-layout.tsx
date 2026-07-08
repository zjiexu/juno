import { Outlet } from 'react-router'

export function AuthLayout() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]">
            <section className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:px-16">
                <header>
                    <span className="text-xl font-semibold tracking-tight">
                        Juno
                    </span>
                </header>

                <div className="flex flex-1 items-center py-12">
                    <div className="mx-auto w-full max-w-md">
                        <Outlet />
                    </div>
                </div>

                <footer className="text-sm text-slate-500">
                    Organize your work. Make progress visible.
                </footer>
            </section>

            <aside className="hidden border-l border-white/10 bg-slate-900 p-12 lg:flex lg:flex-col lg:justify-between">
                <div className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                    Task management, simplified
                </div>
                <div>
                    <p className="max-w-lg text-4xl font-semibold leading-tight">
                        Turn plans into progress, one task at a time.
                    </p>

                    <p className="mt-6 max-w-md text-lg leading-8 text-slate-400">
                        Prioritize what matters, track every stage, and keep
                        your day moving forward.
                    </p>
                </div>

                <p className="text-sm text-slate-500">
                    Built with React, Express, Prisma, and PostgreSQL.
                </p>
            </aside>
        </main>
    )
}