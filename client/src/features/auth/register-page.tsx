import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'

import { ApiError } from '../../lib/api'
import { useRegister } from './auth.queries'
import {
    registerFormSchema,
    type RegisterFormValues,
} from './auth.schemas'

export function RegisterPage() {
    const navigate = useNavigate()
    const registerMutation = useRegister()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    const handleRegistration = (values: RegisterFormValues) => {
        registerMutation.mutate(
            {
                name: values.name,
                email: values.email,
                password: values.password,
            },
            {
                onSuccess: () => {
                    navigate('/dashboard', { replace: true })
                },
            },
        )
    }

    const requestError =
        registerMutation.error instanceof ApiError
            ? registerMutation.error.message
            : registerMutation.isError
                ? 'Unable to create your account. Please try again.'
                : null

    return (
        <div>
            <div className="mb-8">
                <p className="text-sm font-medium text-cyan-300">
                    Get started
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                    Create your Juno account
                </h1>

                <p className="mt-3 text-slate-400">
                    Set up your workspace and start organizing your tasks.
                </p>
            </div>

            <form
                className="space-y-5"
                onSubmit={handleSubmit(handleRegistration)}
            >
                <div>
                    <label
                        className="mb-2 block text-sm font-medium"
                        htmlFor="name"
                    >
                        Name
                    </label>

                    <input
                        {...register('name')}
                        id="name"
                        type="text"
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                        placeholder="Your name"
                    />

                    {errors.name && (
                        <p className="mt-2 text-sm text-rose-400">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        className="mb-2 block text-sm font-medium"
                        htmlFor="register-email"
                    >
                        Email
                    </label>

                    <input
                        {...register('email')}
                        id="register-email"
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
                        htmlFor="register-password"
                    >
                        Password
                    </label>

                    <input
                        {...register('password')}
                        id="register-password"
                        type="password"
                        autoComplete="new-password"
                        aria-invalid={Boolean(errors.password)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                        placeholder="At least 8 characters"
                    />

                    {errors.password && (
                        <p className="mt-2 text-sm text-rose-400">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        className="mb-2 block text-sm font-medium"
                        htmlFor="confirm-password"
                    >
                        Confirm password
                    </label>

                    <input
                        {...register('confirmPassword')}
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        aria-invalid={Boolean(errors.confirmPassword)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                        placeholder="Enter your password again"
                    />

                    {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-rose-400">
                            {errors.confirmPassword.message}
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
                    disabled={registerMutation.isPending}
                >
                    {registerMutation.isPending
                        ? 'Creating account...'
                        : 'Create account'}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link
                    className="font-medium text-cyan-300 hover:text-cyan-200"
                    to="/login"
                >
                    Log in
                </Link>
            </p>
        </div>
    )
}
