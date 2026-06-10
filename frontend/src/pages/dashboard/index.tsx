import { useAuthStore } from '@/store/auth'

export function Dashboard() {
  const user = useAuthStore(s => s.user)

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-800">
        Olá{user ? `, ${user.name}` : ''} 👋
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Dashboard em construção. Em breve você verá suas transações e categorias
        aqui.
      </p>
    </div>
  )
}
