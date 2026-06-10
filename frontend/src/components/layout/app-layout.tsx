import { Logo } from '@/components/common/logo'
import { Outlet } from 'react-router'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Logo />
      </header>
      <main className="flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
