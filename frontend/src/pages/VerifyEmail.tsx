import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { AuthLayout } from '../layouts/AuthLayout'
import { Heading } from '../components/ui/Heading'
import { Text } from '../components/ui/Text'
import { Button } from '../components/ui/Button'
import { AuthService } from '../services/auth'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const hasAttempted = useRef(false)

  useEffect(() => {
    const uid = searchParams.get('uid')
    const token = searchParams.get('token')

    if (!uid || !token) {
      setStatus('error')
      setErrorMsg('Invalid verification link. Missing parameters.')
      return
    }

    if (hasAttempted.current) return
    hasAttempted.current = true

    AuthService.verifyEmail({ uid, token })
      .then(() => {
        setStatus('success')
      })
      .catch((err) => {
        setStatus('error')
        setErrorMsg(err.response?.data?.error || err.response?.data?.message || 'Failed to verify email. The link may have expired.')
      })
  }, [searchParams])

  return (
    <AuthLayout>
      <div className="flex flex-col gap-8 py-8 items-center text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 text-brand-primary animate-spin" />
            <Heading variant="h2" className="text-text-primary">
              Verifying your email...
            </Heading>
            <Text variant="body" className="text-text-secondary">
              Please wait a moment while we verify your email address.
            </Text>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-16 w-16 text-success-text" />
            <Heading variant="h2" className="text-text-primary">
              Email Verified!
            </Heading>
            <Text variant="body" className="text-text-secondary">
              Thank you for verifying your email address. Your account is now fully active.
            </Text>
            <Button
              variant="primary"
              size="md"
              className="mt-4 w-full sm:w-auto"
              onClick={() => navigate('/login')}
            >
              Go to Sign In
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-danger-text" />
            <Heading variant="h2" className="text-text-primary">
              Verification Failed
            </Heading>
            <Text variant="body" className="text-danger-text bg-danger-bg/10 p-4 rounded-md">
              {errorMsg}
            </Text>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/login')}
              >
                Back to Sign In
              </Button>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
