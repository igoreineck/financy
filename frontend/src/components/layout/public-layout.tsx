import { LogoIcon } from '@/components/common/logo-icon'
import { Outlet } from 'react-router'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="flex items-center justify-center px-6 py-8">
        <LogoIcon className="size-10" />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-12">
        <Outlet />
      </main>
    </div>
  )
}
