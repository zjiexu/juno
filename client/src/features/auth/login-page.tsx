import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'

import { ApiError } from '../../lib/api'
import { useLogin } from './auth.queries'
import {
    loginFormSchema,
    type LoginFormValues,
} from './auth.schemas'

export function LoginPage() {
    const navigate = useNavigate()
    const loginMutation = useLogin()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const handleLogin = (values: LoginFormValues) => {
        loginMutation.mutate(values, {
            onSuccess: () => {
                navigate('/dashboard', { replace: true })
            },
        })
    }

    const requestError =
        loginMutation.error instanceof ApiError
            ? loginMutation.error.message
            : loginMutation.isError
                ? 'Unable to log in. Please try again.'
                : null

    return (
        <div>
            <div className="mb-8">
                <p className="text-sm font-medium text-cyan-300">
                    Welcome back
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                    Log in to Juno
                </h1>

                <p className="mt-3 text-slate-400">
                    Enter your details to continue managing your tasks.
                </p>
            </div>

            <form
                className="space-y-5"
                onSubmit={handleSubmit(handleLogin)}
            >
                <div>
                    <label
                        className="mb-2 block text-sm font-medium"
                        htmlFor="email"
                    >
                        Email
                    </label>

                    <input
                        {...register('email')}
                        id="email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                        placeholder="you@example.com"
                    />

                    {errors.email && (
                        <p className="mt-2 text-sm text-rose-400">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        className="mb-2 block text-sm font-medium"
                        htmlFor="password"
                    >
                        Password
                    </label>

                    <input
                        {...register('password')}
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        aria-invalid={Boolean(errors.password)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                        placeholder="Enter your password"
                    />
                    {errors.password && (
                        <p className="mt-2 text-sm text-rose-400">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {requestError && (
                    <p
                        className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
                        role="alert"
                    >
                        {requestError}
                    </p>
                )}

                <button
                    className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending
                        ? 'Logging in...'
                        : 'Log in'}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
                Don&apos;t have an account?{' '}
                <Link
                    className="font-medium text-cyan-300 hover:text-cyan-200"
                    to="/register"
                >
                    Create one
                </Link>
            </p>
        </div>
    )
}
