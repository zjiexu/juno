import {
    createBrowserRouter,
    Navigate,
} from 'react-router'

import { AuthLayout } from '../features/auth/auth-layout'
import { LoginPage } from '../features/auth/login-page'
import { RegisterPage } from '../features/auth/register-page'
import { DashboardPage } from '../features/dashboard/dashboard-page'
import {
    ProtectedRoute,
    PublicOnlyRoute,
} from './route-guards'

export const router = createBrowserRouter([
    {
        element: <PublicOnlyRoute />,
        children: [
            {
                element: <AuthLayout />,
                children: [
                    {
                        path: '/login',
                        element: <LoginPage />,
                    },
                    {
                        path: '/register',
                        element: <RegisterPage />,
                    },
                ],
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/dashboard',
                element: <DashboardPage />,
            },
        ],
    },
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
    },
])
