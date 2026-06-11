import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { useAuthStore } from '@/store/auth'
import { useMutation } from '@apollo/client/react'
import { LogIn, Mail, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { AuthCard } from './components/auth-card'
import { RegisterMutation } from './queries'

const signUpSchema = z
  .object({
    name: z.string().min(1, 'Nome obrigatório'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

type SignUpForm = z.infer<typeof signUpSchema>

export function SignUp() {
  const navigate = useNavigate()
  const setSession = useAuthStore(s => s.setSession)
  const [registerMutation, { loading }] = useMutation(RegisterMutation)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpForm>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async raw => {
    const parsed = signUpSchema.safeParse(raw)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof SignUpForm, {
          message: issue.message,
        })
      }
      return
    }

    const { name, email, password } = parsed.data
    try {
      const result = await registerMutation({
        variables: { data: { name, email, password } },
      })
      if (!result.data) {
        toast.error('Não foi possível concluir o cadastro')
        return
      }
      setSession(result.data.register)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao cadastrar')
    }
  })

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Comece a controlar suas finanças ainda hoje"
      align="center"
      footer={
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            ou
            <span className="h-px flex-1 bg-gray-200" />
          </div>
          <p className="text-center text-sm text-gray-500">Já tem uma conta?</p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">
              <LogIn className="size-4" /> Fazer login
            </Link>
          </Button>
        </div>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" state={errors.name ? 'error' : 'default'}>
            Nome completo
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            icon={<User />}
            error={Boolean(errors.name)}
            autoComplete="name"
            {...register('name')}
          />
          {errors.name ? (
            <span className="text-xs text-danger">{errors.name.message}</span>
          ) : null}
        </div>

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
          <PasswordInput
            id="password"
            placeholder="Digite sua senha"
            error={Boolean(errors.password)}
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password ? (
            <span className="text-xs text-danger">
              {errors.password.message}
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              A senha deve ter no mínimo 8 caracteres
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="confirmPassword"
            state={errors.confirmPassword ? 'error' : 'default'}
          >
            Confirmar senha
          </Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Repita a senha"
            error={Boolean(errors.confirmPassword)}
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <span className="text-xs text-danger">
              {errors.confirmPassword.message}
            </span>
          ) : null}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>
    </AuthCard>
  )
}
