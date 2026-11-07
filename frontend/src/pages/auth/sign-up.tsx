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
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
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
        toast.error('Could not complete sign-up')
        return
      }
      setSession(result.data.register)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sign up')
    }
  })

  return (
    <AuthCard
      title="Create account"
      subtitle="Start taking control of your finances today"
      align="center"
      footer={
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            or
            <span className="h-px flex-1 bg-gray-200" />
          </div>
          <p className="text-center text-sm text-gray-500">
            Already have an account?
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">
              <LogIn className="size-4" /> Log in
            </Link>
          </Button>
        </div>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" state={errors.name ? 'error' : 'default'}>
            Full name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
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
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="mail@example.com"
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
            Password
          </Label>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
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
              Password must be at least 8 characters
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="confirmPassword"
            state={errors.confirmPassword ? 'error' : 'default'}
          >
            Confirm password
          </Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Repeat your password"
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
          {loading ? 'Signing up...' : 'Sign up'}
        </Button>
      </form>
    </AuthCard>
  )
}
