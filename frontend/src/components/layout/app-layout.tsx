import { Logo } from '@/components/common/logo'
import { cn } from '@/lib/utils'
import { NavLink, Outlet } from 'react-router'

const navLinks = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/categorias', label: 'Categorias' },
]

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="flex items-center gap-2">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-base/10 text-brand-base'
                      : 'text-gray-600 hover:bg-gray-100',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
