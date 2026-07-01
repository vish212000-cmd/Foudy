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
import { Divider } from '../components/ui/Divider'
import { AuthService } from '../services/auth'
import { useAuthStore } from '../store/auth'
import { useGoogleLogin } from '@react-oauth/google'

function GoogleIcon() {
  return (
    <div
      className="h-5 w-5 rounded-full bg-surface-hover border border-border-default flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      <span className="text-xs font-bold text-text-primary leading-none select-none">G</span>
    </div>
  )
}

function AppleIcon() {
  return (
    <svg
      className="h-5 w-5 text-text-primary shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true)
      setApiError(null)
      try {
        const { user, access_token } = await AuthService.googleLogin({ access_token: tokenResponse.access_token })
        setCredentials(user, access_token)
        if (user.profile_completed) {
          navigate('/home')
        } else {
          navigate('/setup')
        }
      } catch (err: any) {
        setApiError(err.response?.data?.error || 'Google signup failed. Please try again.')
        setIsGoogleLoading(false)
      }
    },
    onError: () => {
      setApiError('Google signup was unsuccessful.')
    }
  })

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
      navigate('/setup')
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

          <div className="flex items-center gap-3" role="separator" aria-label="Or continue with a social account">
            <Divider className="flex-1" />
            <Text
              variant="caption"
              as="span"
              className="text-text-tertiary shrink-0 whitespace-nowrap"
            >
              or continue with
            </Text>
            <Divider className="flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              size="md"
              type="button"
              className="w-full gap-2.5"
              aria-label="Continue with Google"
              onClick={() => handleGoogleLogin()}
              disabled={isSubmitting || isGoogleLoading}
            >
              {isGoogleLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <GoogleIcon />}
              <span>Google</span>
            </Button>

            <Button
              variant="secondary"
              size="md"
              type="button"
              className="w-full gap-2.5"
              aria-label="Continue with Apple"
            >
              <AppleIcon />
              <span>Apple</span>
            </Button>
          </div>
        </div>

        <Text variant="caption" className="text-center text-text-tertiary">
          By signing up you agree to our{' '}
          <Link
            to="/terms"
            className="text-text-secondary hover:text-text-primary hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy"
            className="text-text-secondary hover:text-text-primary hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Privacy Policy
          </Link>
          .
        </Text>
      </div>
    </AuthLayout>
  )
}
