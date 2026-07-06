import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Users, MessageSquare, ArrowRight, Loader2 } from 'lucide-react'
import { AuthLayout } from '../layouts/AuthLayout'
import { Button } from '../components/ui/Button'
import { Heading } from '../components/ui/Heading'
import { Text } from '../components/ui/Text'
import { AuthService } from '../services/auth'
import { useAuthStore } from '../store/auth'

interface FeatureItem {
  icon: React.ReactNode
  title: string
  description: string
}

const features: FeatureItem[] = [
  {
    icon: <Radio className="h-5 w-5 text-brand-primary flex-shrink-0" aria-hidden="true" />,
    title: 'Random Match',
    description: 'Get matched instantly with someone new',
  },
  {
    icon: <Users className="h-5 w-5 text-brand-primary flex-shrink-0" aria-hidden="true" />,
    title: 'Group Rooms',
    description: 'Join topic-based rooms with up to 6 people',
  },
  {
    icon: <MessageSquare className="h-5 w-5 text-brand-primary flex-shrink-0" aria-hidden="true" />,
    title: 'Text & Voice',
    description: 'Choose how you want to connect',
  },
]

/**
 * Welcome — Onboarding welcome screen using AuthLayout.
 */
export function Welcome() {
  const navigate = useNavigate()
  const { setCredentials } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGuestLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { user, access_token } = await AuthService.guestLogin()
      setCredentials(user, access_token)
      navigate('/profile')
    } catch {
      setError('Failed to start as guest. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-8 py-10">

        {/* Logo mark */}
        <div
          className="h-16 w-16 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 select-none"
          role="img"
          aria-label="FOUDY logo"
        >
          <span className="text-2xl font-extrabold text-text-inverse tracking-tight">
            F
          </span>
        </div>

        {/* Heading + tagline */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Heading
            variant="h1"
            className="text-text-primary"
          >
            Welcome to FOUDY
          </Heading>
          <Text
            variant="body"
            className="text-text-secondary max-w-xs"
          >
            Discover real conversations with real people. Video, audio, or text — your choice.
          </Text>
          {error && (
            <Text variant="caption" className="text-destructive font-medium mt-2">
              {error}
            </Text>
          )}
        </div>

        {/* Feature highlights */}
        <ul
          className="w-full flex flex-col gap-3"
          aria-label="Key features"
          role="list"
        >
          {features.map((feature) => (
            <li
              key={feature.title}
              className="flex items-start gap-4 bg-surface rounded-lg p-4 border border-border-default"
            >
              {feature.icon}
              <div className="flex flex-col gap-0.5 min-w-0">
                <Text
                  variant="label"
                  className="text-text-primary font-semibold"
                  as="span"
                >
                  {feature.title}
                </Text>
                <Text
                  variant="caption"
                  className="text-text-secondary"
                  as="span"
                >
                  {feature.description}
                </Text>
              </div>
            </li>
          ))}
        </ul>

        {/* CTA buttons */}
        <div className="w-full flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            aria-label="Get started with FOUDY"
            data-testid="guest-login"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Get Started'}
            {!isLoading && <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            aria-label="Sign in to your existing FOUDY account"
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            Sign In
          </Button>
        </div>

      </div>
    </AuthLayout>
  )
}

export default Welcome
