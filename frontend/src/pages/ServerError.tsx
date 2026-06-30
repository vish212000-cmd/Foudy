import { useState } from "react"
import { AlertCircle, Home, RefreshCw } from "lucide-react"
import { EmptyState } from "../components/ui/EmptyState"
import { Button } from "../components/ui/Button"
import { Text } from "../components/ui/Text"

export function ServerError() {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = () => {
    setIsRetrying(true)
    window.location.reload()
  }

  return (
    <main
      className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4"
      aria-labelledby="server-error-heading"
      role="main"
    >
      {/* Decorative background glow */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl aspect-square rounded-full bg-danger-text opacity-5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <EmptyState
          id="server-error-heading"
          icon={
            <AlertCircle
              className="h-8 w-8 text-danger-text"
              aria-hidden="true"
              strokeWidth={1.5}
            />
          }
          title="Something Went Wrong"
          description="We're having trouble connecting to our servers. Our team has been notified and is working on a fix."
          action={
            <div
              className="flex flex-col items-center gap-3 w-full"
              role="group"
              aria-label="Error recovery actions"
            >
              <Button
                variant="primary"
                size="md"
                onClick={handleRetry}
                isLoading={isRetrying}
                aria-label="Retry the request"
                className="gap-2 min-w-40"
              >
                {!isRetrying && (
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                )}
                {isRetrying ? "Retrying\u2026" : "Retry"}
              </Button>

              <Button
                variant="ghost"
                size="md"
                aria-label="Go to home page"
                className="gap-2"
                onClick={() => {
                  /* static demo — no navigation */
                }}
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Go Home
              </Button>
            </div>
          }
          className="border-dashed border-border-default"
        />

        {/* Error code badge */}
        <div className="mt-6 flex justify-center">
          <Text
            variant="caption"
            className="text-text-tertiary font-mono tabular-nums"
            role="note"
            aria-label="HTTP error code 500"
          >
            Error 500
          </Text>
        </div>
      </div>
    </main>
  )
}

export default ServerError
