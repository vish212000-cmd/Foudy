import React, { useState } from "react"
import { WifiOff, RefreshCw } from "lucide-react"
import { Heading } from "../components/ui/Heading"
import { Text } from "../components/ui/Text"
import { Button } from "../components/ui/Button"

export function NoInternet() {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = () => {
    setIsRetrying(true)
    setTimeout(() => setIsRetrying(false), 1500)
  }

  return (
    <main
      className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4"
      aria-labelledby="no-internet-heading"
      role="main"
    >
      {/* Decorative background glow */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-brand-primary opacity-[0.04] blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* Icon container */}
        <div
          className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-surface border border-border-default shadow-lg"
          aria-hidden="true"
        >
          <WifiOff className="h-20 w-20 text-text-tertiary" strokeWidth={1.5} />
        </div>

        {/* Heading */}
        <Heading
          id="no-internet-heading"
          variant="h2"
          className="text-text-primary mb-3"
        >
          No Internet Connection
        </Heading>

        {/* Body copy */}
        <Text
          variant="body"
          className="text-text-secondary mb-8 max-w-sm leading-relaxed"
        >
          It looks like you&rsquo;re not connected. Check your Wi-Fi or mobile
          data and try again.
        </Text>

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleRetry}
          isLoading={isRetrying}
          aria-label="Retry internet connection"
          className="gap-2 min-w-[160px]"
        >
          {!isRetrying && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
          {isRetrying ? "Checking\u2026" : "Try Again"}
        </Button>

        {/* Footer caption */}
        <Text
          variant="caption"
          className="text-text-tertiary mt-6"
          role="note"
        >
          FOUDY needs an internet connection to work
        </Text>
      </div>
    </main>
  )
}

export default NoInternet
