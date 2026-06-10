import { ProtectedRoute } from '@/components/guards/protected-route'
import { PublicRoute } from '@/components/guards/public-route'
import { AppLayout } from '@/components/layout/app-layout'
import { PublicLayout } from '@/components/layout/public-layout'
import { Login } from '@/pages/auth/login'
import { SignUp } from '@/pages/auth/sign-up'
import { CategoriesPage } from '@/pages/categories/categories-page'
import { Dashboard } from '@/pages/dashboard'
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
        path: '/cadastro',
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
      { path: '/', element: <Dashboard /> },
      { path: '/categorias', element: <CategoriesPage /> },
    ],
  },
])
