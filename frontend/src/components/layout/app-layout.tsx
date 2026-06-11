import { Logo } from '@/components/common/logo'
import { cn } from '@/lib/utils'
import { NavLink, Outlet } from 'react-router'

const navLinks = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transacoes', label: 'Transações' },
  { to: '/categorias', label: 'Categorias' },
]

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="grid grid-cols-3 items-center border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center">
          <Logo />
        </div>
        <nav className="flex items-center justify-center gap-6">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'text-sm transition-colors',
                  isActive
                    ? 'font-bold text-brand-base'
                    : 'font-medium text-gray-600 hover:text-gray-800',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div aria-hidden="true" />
      </header>
      <main className="flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
