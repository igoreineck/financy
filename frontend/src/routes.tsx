import { ProtectedRoute } from '@/components/guards/protected-route'
import { PublicRoute } from '@/components/guards/public-route'
import { AppLayout } from '@/components/layout/app-layout'
import { PublicLayout } from '@/components/layout/public-layout'
import { Login } from '@/pages/auth/login'
import { SignUp } from '@/pages/auth/sign-up'
import { CategoriesPage } from '@/pages/categories/categories-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { ProfilePage } from '@/pages/profile/profile-page'
import { TransactionsPage } from '@/pages/transactions/transactions-page'
import { createBrowserRouter } from 'react-router'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: '/signup',
        element: (
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        ),
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/transactions', element: <TransactionsPage /> },
      { path: '/categories', element: <CategoriesPage /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
])
