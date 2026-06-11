import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MeDocument, UpdateProfileDocument } from '@/gql/graphql'
import { useLogout } from '@/lib/auth'
import { getInitials } from '@/lib/initials'
import { useAuthStore } from '@/store/auth'
import { useMutation, useQuery } from '@apollo/client/react'
import { LogOut, Mail, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

const nameSchema = z.string().trim().min(1, 'Nome obrigatório')

export function ProfilePage() {
  const { data, loading } = useQuery(MeDocument)
  const [updateProfile, { loading: saving }] = useMutation(
    UpdateProfileDocument,
  )
  const setSession = useAuthStore(s => s.setSession)
  const token = useAuthStore(s => s.token)
  const logout = useLogout()

  const me = data?.me
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  useEffect(() => {
    if (me) setName(me.name)
  }, [me])

  const initials = me ? getInitials(name || me.name) : '...'

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = nameSchema.safeParse(name)
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message ?? 'Nome obrigatório')
      return
    }
    setNameError(null)

    try {
      const result = await updateProfile({
        variables: { data: { name: parsed.data } },
      })
      const updated = result.data?.updateProfile
      if (!updated || !token) {
        toast.error('Não foi possível salvar o perfil')
        return
      }
      setSession({
        token,
        user: { id: updated.id, name: updated.name, email: updated.email },
      })
      toast.success('Perfil atualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <section
        aria-label="Dados do usuário"
        className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-8"
      >
        {loading || !me ? (
          <ProfileSkeleton />
        ) : (
          <>
            <div className="flex flex-col items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-flex size-20 items-center justify-center rounded-full bg-gray-200 text-xl font-semibold text-gray-800"
              >
                {initials}
              </span>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-lg font-semibold text-gray-800">
                  {me.name}
                </span>
                <span className="text-sm text-gray-500">{me.email}</span>
              </div>
            </div>

            <hr className="border-gray-200" />

            <form
              className="flex flex-col gap-5"
              onSubmit={onSubmit}
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="profile-name"
                  state={nameError ? 'error' : 'default'}
                >
                  Nome completo
                </Label>
                <Input
                  id="profile-name"
                  type="text"
                  icon={<User />}
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    if (nameError) setNameError(null)
                  }}
                  error={Boolean(nameError)}
                  autoComplete="name"
                />
                {nameError ? (
                  <span className="text-xs text-danger">{nameError}</span>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile-email">E-mail</Label>
                <Input
                  id="profile-email"
                  type="email"
                  icon={<Mail />}
                  value={me.email}
                  disabled
                  readOnly
                />
                <span className="text-xs text-gray-500">
                  O e-mail não pode ser alterado
                </span>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </form>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void logout()
              }}
              className="w-full text-danger hover:bg-red-light hover:text-red-base"
            >
              <LogOut className="size-4" /> Sair da conta
            </Button>
          </>
        )}
      </section>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        aria-label="Carregando avatar"
        className="inline-block size-20 animate-pulse rounded-full bg-gray-200"
      />
      <div className="flex w-full flex-col items-center gap-2">
        <span className="h-5 w-40 animate-pulse rounded bg-gray-200" />
        <span className="h-4 w-56 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  )
}
