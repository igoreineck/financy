import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/components/ui/link'
import { useAuthStore } from '@/store/auth'
import { useMutation } from '@apollo/client/react'
import { Lock, Mail, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { AuthCard } from './components/auth-card'
import { RegisterMutation } from './queries'

const signUpSchema = z
  .object({
    name: z.string().min(1, 'Nome obrigatório'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
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
      subtitle="Comece a organizar suas finanças em minutos."
      footer={
        <span>
          Já tem conta? <Link to="/login">Fazer login</Link>
        </span>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" state={errors.name ? 'error' : 'default'}>
            Nome
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Como podemos te chamar?"
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
            placeholder="seu@email.com"
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
            placeholder="Mínimo 6 caracteres"
            icon={<Lock />}
            error={Boolean(errors.password)}
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password ? (
            <span className="text-xs text-danger">
              {errors.password.message}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="confirmPassword"
            state={errors.confirmPassword ? 'error' : 'default'}
          >
            Confirmar senha
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repita a senha"
            icon={<Lock />}
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
