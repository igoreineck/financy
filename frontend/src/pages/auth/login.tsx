import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/components/ui/link'
import { useAuthStore } from '@/store/auth'
import { useMutation } from '@apollo/client/react'
import { Lock, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { AuthCard } from './components/auth-card'
import { LoginMutation } from './queries'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema> & { remember: boolean }

export function Login() {
  const navigate = useNavigate()
  const setSession = useAuthStore(s => s.setSession)
  const [login, { loading }] = useMutation(LoginMutation)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: '', password: '', remember: false },
  })

  const onSubmit = handleSubmit(async raw => {
    const parsed = loginSchema.safeParse(raw)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof LoginForm, {
          message: issue.message,
        })
      }
      return
    }

    try {
      const result = await login({ variables: { data: parsed.data } })
      if (!result.data) {
        toast.error('Não foi possível fazer login')
        return
      }
      setSession({ ...result.data.login, remember: Boolean(raw.remember) })
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao entrar')
    }
  })

  return (
    <AuthCard
      title="Fazer login"
      subtitle="Entre na sua conta para continuar"
      footer={
        <span>
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </span>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" state={errors.email ? 'error' : 'default'}>
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="mail@exemplo.com"
            icon={<Mail />}
            error={Boolean(errors.email)}
            autoComplete="email"
            {...register('email')}
          />
          {errors.email ? (
            <span className="text-xs text-danger">{errors.email.message}</span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="password"
            state={errors.password ? 'error' : 'default'}
          >
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            icon={<Lock />}
            error={Boolean(errors.password)}
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password ? (
            <span className="text-xs text-danger">
              {errors.password.message}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              className="size-4 rounded border-gray-300 text-brand-base focus:ring-brand-base/40"
              {...register('remember')}
            />
            Lembrar-me
          </label>
          <span
            aria-disabled="true"
            title="Em breve"
            className="cursor-not-allowed text-gray-400"
          >
            Esqueceu a senha?
          </span>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthCard>
  )
}
