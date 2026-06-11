import { Outlet } from 'react-router'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Outlet />
      </main>
    </div>
  )
}
