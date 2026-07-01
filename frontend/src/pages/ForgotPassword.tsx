import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '../layouts/AuthLayout'
import { Heading } from '../components/ui/Heading'
import { Text } from '../components/ui/Text'
import { Button } from '../components/ui/Button'
import { TextInput } from '../components/ui/TextInput'
import { AuthService } from '../services/auth'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setApiError(null)
    try {
      await AuthService.requestPasswordReset({ email: data.email })
      setIsSuccess(true)
    } catch (err: any) {
      setApiError(err.response?.data?.error || err.response?.data?.email?.[0] || 'Failed to send reset email. Please try again.')
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-8 py-8 items-center max-w-md mx-auto w-full">
        {isSuccess ? (
          <div className="flex flex-col gap-4 text-center items-center">
            <CheckCircle2 className="h-16 w-16 text-success-text" />
            <Heading variant="h2" className="text-text-primary">
              Check your email
            </Heading>
            <Text variant="body" className="text-text-secondary">
              If an account exists for that email address, we have sent password reset instructions.
            </Text>
            <Link
              to="/login"
              className="mt-6 flex items-center gap-2 text-brand-primary font-medium hover:underline focus-visible:outline-none focus-visible:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2 text-center">
              <Heading variant="h2" className="text-text-primary">
                Forgot Password
              </Heading>
              <Text variant="body" className="text-text-secondary">
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              {apiError && (
                <div className="bg-danger-bg/10 text-danger-text text-sm font-medium p-3 rounded-md mt-2">
                  {apiError}
                </div>
              )}
            </div>

            <div className="bg-surface border border-border-default rounded-xl shadow-sm p-6 sm:p-8 flex flex-col gap-5 w-full">
              <form
                aria-label="Forgot password form"
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

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full mt-2"
                    aria-label="Send reset link"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send reset link'}
                  </Button>
                </div>
              </form>
            </div>
            
            <div className="text-center mt-2">
              <Link
                to="/login"
                className="flex justify-center items-center gap-2 text-text-secondary hover:text-text-primary font-medium hover:underline focus-visible:outline-none focus-visible:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
