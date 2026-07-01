import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '../layouts/AuthLayout'
import { Button } from '../components/ui/Button'
import { TextInput } from '../components/ui/TextInput'
import { PasswordInput } from '../components/ui/PasswordInput'
import { Heading } from '../components/ui/Heading'
import { Text } from '../components/ui/Text'
import { AuthService } from '../services/auth'
import { useAuthStore } from '../store/auth'

const registerSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(30, 'Display name cannot exceed 30 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function Register() {
  const navigate = useNavigate()
  const { setCredentials } = useAuthStore()
  
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError(null)
    try {
      const { user, access_token } = await AuthService.register({ 
        email: data.email, 
        password: data.password, 
        display_name: data.displayName 
      })
      setCredentials(user, access_token)
      navigate('/profile')
    } catch (err: any) {
      setApiError(err.response?.data?.email?.[0] || err.response?.data?.password?.[0] || err.response?.data?.error || 'Failed to register. Please try again.')
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-8 py-8">

        <div className="flex flex-col gap-2 text-center">
          <Heading variant="h2" className="text-text-primary">
            Create an account
          </Heading>
          <Text variant="caption" className="text-text-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-primary font-medium hover:underline focus-visible:outline-none focus-visible:underline"
              aria-label="Go to sign in page"
            >
              Sign in
            </Link>
          </Text>
          {apiError && (
            <div className="bg-danger-bg/10 text-danger-text text-sm font-medium p-3 rounded-md mt-2">
              {apiError}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border-default rounded-xl shadow-sm p-6 sm:p-8 flex flex-col gap-5">
          <form
            aria-label="Sign up form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-5">
              
              <TextInput
                id="displayName"
                label="Display Name"
                type="text"
                placeholder="How should we call you?"
                aria-invalid={!!errors.displayName}
                error={errors.displayName?.message}
                disabled={isSubmitting}
                {...register('displayName')}
              />

              <TextInput
                id="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                error={errors.email?.message}
                disabled={isSubmitting}
                {...register('email')}
              />

              <PasswordInput
                id="password"
                label="Password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                error={errors.password?.message}
                disabled={isSubmitting}
                {...register('password')}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-4"
                aria-label="Sign up for a FOUDY account"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}
