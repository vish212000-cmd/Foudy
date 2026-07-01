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
import { Checkbox } from '../components/ui/Checkbox'
import { Divider } from '../components/ui/Divider'
import { Heading } from '../components/ui/Heading'
import { Text } from '../components/ui/Text'
import { AuthService } from '../services/auth'
import { useAuthStore } from '../store/auth'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

type LoginFormValues = z.infer<typeof loginSchema>

function FoudyLogo() {
  return (
    <div className="flex items-center justify-center gap-2" aria-label="FOUDY">
      <div
        className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <span className="text-text-inverse font-bold text-base leading-none select-none">F</span>
      </div>
      <span className="text-text-primary font-bold text-xl tracking-tight select-none">FOUDY</span>
    </div>
  )
}

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

export default function Login() {
  const navigate = useNavigate()
  const { setCredentials } = useAuthStore()
  const [rememberMe, setRememberMe] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null)
    try {
      const { user, access_token } = await AuthService.login(data)
      setCredentials(user, access_token)
      navigate('/profile')
    } catch (err: any) {
      setApiError(err.response?.data?.error || 'Failed to sign in. Please check your credentials and try again.')
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-8 py-8">

        <FoudyLogo />

        <div className="flex flex-col gap-2 text-center">
          <Heading variant="h2" className="text-text-primary">
            Sign in to FOUDY
          </Heading>
          <Text variant="caption" className="text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-brand-primary font-medium hover:underline focus-visible:outline-none focus-visible:underline"
              aria-label="Go to sign up page"
            >
              Sign up
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
            aria-label="Sign in form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-5">

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
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                error={errors.password?.message}
                disabled={isSubmitting}
                {...register('password')}
              />

              <div className="flex items-center justify-between gap-4">
                <label
                  className="flex items-center gap-2 cursor-pointer group"
                  htmlFor="remember-me"
                >
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(val) => setRememberMe(val === true)}
                    aria-label="Remember me on this device"
                  />
                  <Text
                    variant="caption"
                    as="span"
                    className="text-text-secondary group-hover:text-text-primary transition-colors select-none"
                  >
                    Remember me
                  </Text>
                </label>

                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline shrink-0"
                  aria-label="Forgot your password? Reset it here"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-1"
                aria-label="Sign in to your FOUDY account"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign in'}
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
            >
              <GoogleIcon />
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
          By signing in you agree to our{' '}
          <a
            href="/terms"
            className="text-text-secondary hover:text-text-primary hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/privacy"
            className="text-text-secondary hover:text-text-primary hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Privacy Policy
          </a>
          .
        </Text>
      </div>
    </AuthLayout>
  )
}

