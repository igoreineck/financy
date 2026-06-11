import { Button } from '@/components/ui/button'
import { MeDocument } from '@/gql/graphql'
import { useLogout } from '@/lib/auth'
import { getInitials } from '@/lib/initials'
import { useQuery } from '@apollo/client/react'
import { LogOut } from 'lucide-react'

export function ProfilePage() {
  const { data, loading } = useQuery(MeDocument)
  const logout = useLogout()

  const me = data?.me
  const initials = me ? getInitials(me.name) : '...'
  const createdAt = me
    ? new Date(me.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Meu perfil</h1>
        <p className="text-sm text-gray-500">
          Veja e gerencie a conta conectada.
        </p>
      </header>

      <section
        aria-label="Dados do usuário"
        className="flex flex-col items-center gap-6 rounded-xl border border-gray-200 bg-white p-8"
      >
        {loading || !me ? (
          <ProfileSkeleton />
        ) : (
          <>
            <span
              aria-hidden="true"
              className="inline-flex size-24 items-center justify-center rounded-full bg-brand-base text-2xl font-semibold text-white"
            >
              {initials}
            </span>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-xl font-semibold text-gray-800">
                {me.name}
              </span>
              <span className="text-sm text-gray-500">{me.email}</span>
              <span className="mt-2 text-xs text-gray-400">
                Conta criada em {createdAt}
              </span>
            </div>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void logout()
          }}
          className="text-danger hover:bg-red-light hover:text-red-base"
        >
          <LogOut className="size-4" /> Sair da conta
        </Button>
      </section>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <>
      <span
        aria-label="Carregando avatar"
        className="inline-block size-24 animate-pulse rounded-full bg-gray-200"
      />
      <div className="flex w-full flex-col items-center gap-2">
        <span className="h-5 w-40 animate-pulse rounded bg-gray-200" />
        <span className="h-4 w-56 animate-pulse rounded bg-gray-200" />
      </div>
    </>
  )
}
