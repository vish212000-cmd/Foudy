import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '../layouts/AuthLayout'
import { Heading } from '../components/ui/Heading'
import { Text } from '../components/ui/Text'
import { Button } from '../components/ui/Button'
import { PasswordInput } from '../components/ui/PasswordInput'
import { AuthService } from '../services/auth'

const resetPasswordSchema = z.object({
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  useEffect(() => {
    if (!uid || !token) {
      setStatus('error')
      setErrorMsg('Invalid password reset link. Missing parameters.')
    }
  }, [uid, token])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: ''
    }
  })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!uid || !token) return
    setStatus('idle')
    setErrorMsg('')
    try {
      await AuthService.resetPassword({ 
        uid, 
        token, 
        new_password: data.new_password 
      })
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || 'Failed to reset password. The link may have expired.')
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-8 py-8 items-center max-w-md mx-auto w-full">
        {status === 'success' ? (
          <div className="flex flex-col gap-4 text-center items-center">
            <CheckCircle2 className="h-16 w-16 text-success-text" />
            <Heading variant="h2" className="text-text-primary">
              Password Reset
            </Heading>
            <Text variant="body" className="text-text-secondary">
              Your password has been successfully reset. You can now sign in with your new password.
            </Text>
            <Button
              variant="primary"
              size="md"
              className="mt-6 w-full"
              onClick={() => navigate('/login')}
            >
              Go to Sign In
            </Button>
          </div>
        ) : status === 'error' && (!uid || !token) ? (
           <div className="flex flex-col gap-4 text-center items-center">
             <XCircle className="h-16 w-16 text-danger-text" />
             <Heading variant="h2" className="text-text-primary">
               Invalid Link
             </Heading>
             <Text variant="body" className="text-danger-text bg-danger-bg/10 p-4 rounded-md">
               {errorMsg}
             </Text>
             <Button
               variant="secondary"
               size="md"
               className="mt-4"
               onClick={() => navigate('/forgot-password')}
             >
               Request new link
             </Button>
           </div>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2 text-center">
              <Heading variant="h2" className="text-text-primary">
                Create new password
              </Heading>
              <Text variant="body" className="text-text-secondary">
                Please enter your new password below.
              </Text>
              {status === 'error' && (
                <div className="bg-danger-bg/10 text-danger-text text-sm font-medium p-3 rounded-md mt-2">
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="bg-surface border border-border-default rounded-xl shadow-sm p-6 sm:p-8 flex flex-col gap-5 w-full">
              <form
                aria-label="Reset password form"
                noValidate
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="flex flex-col gap-5">
                  <PasswordInput
                    id="new_password"
                    label="New Password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.new_password}
                    error={errors.new_password?.message}
                    disabled={isSubmitting}
                    {...register('new_password')}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full mt-2"
                    aria-label="Reset password"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Reset password'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
