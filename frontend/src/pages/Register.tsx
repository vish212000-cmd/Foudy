import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '../layouts/AuthLayout'
import { Button } from '../components/ui/Button'
import { TextInput } from '../components/ui/TextInput'
import { PasswordInput } from '../components/ui/PasswordInput'
import { Heading } from '../components/ui/Heading'
import { Text } from '../components/ui/Text'
import { AuthService } from '../services/auth'
import { useAuthStore } from '../store/auth'

export default function Register() {
  const navigate = useNavigate()
  const { setCredentials } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !displayName) {
      setError('Please fill in all fields.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { user, access_token } = await AuthService.register({ email, password, display_name: displayName })
      setCredentials(user, access_token)
      navigate('/profile')
    } catch (err: any) {
      setError(err.response?.data?.email?.[0] || err.response?.data?.password?.[0] || 'Failed to register. Please try again.')
    } finally {
      setIsLoading(false)
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
            <a
              href="/login"
              className="text-brand-primary font-medium hover:underline focus-visible:outline-none focus-visible:underline"
              aria-label="Go to sign in page"
            >
              Sign in
            </a>
          </Text>
          {error && (
            <Text variant="caption" className="text-destructive font-medium mt-2">
              {error}
            </Text>
          )}
        </div>

        <div className="bg-surface border border-border-default rounded-xl shadow-sm p-6 sm:p-8 flex flex-col gap-5">
          <form
            aria-label="Sign up form"
            noValidate
            onSubmit={handleRegister}
          >
            <div className="flex flex-col gap-5">
              
              <TextInput
                id="displayName"
                label="Display Name"
                type="text"
                placeholder="How should we call you?"
                aria-required="true"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
              />

              <TextInput
                id="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-required="true"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />

              <PasswordInput
                id="password"
                label="Password"
                autoComplete="new-password"
                aria-required="true"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-4"
                aria-label="Sign up for a FOUDY account"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}
