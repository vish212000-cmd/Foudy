import React from 'react'
import { Spinner } from '../components/ui/Spinner'

/**
 * Splash — Full-screen animated loading screen shown on first app load.
 * Standalone: no router deps, no AuthLayout.
 */
export function Splash() {
  return (
    <main
      className="min-h-screen w-full bg-canvas flex flex-col items-center justify-center gap-6 px-4"
      aria-label="FOUDY loading screen"
      role="main"
    >
      {/* Logo mark */}
      <div
        className="animate-pulse flex flex-col items-center gap-5"
        aria-hidden="true"
      >
        <div
          className="h-20 w-20 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 select-none"
          aria-label="FOUDY logo"
        >
          <span className="text-2xl font-extrabold text-text-inverse tracking-tight">
            F
          </span>
        </div>
      </div>

      {/* Wordmark + tagline */}
      <div className="flex flex-col items-center gap-2 text-center">
        <span
          className="text-4xl font-extrabold tracking-tight text-text-primary select-none"
          aria-label="FOUDY"
        >
          FOUDY
        </span>
        <p className="text-base text-text-secondary font-normal tracking-wide">
          Meet people. Have conversations.
        </p>
      </div>

      {/* Loading indicator */}
      <Spinner
        size="lg"
        aria-label="Loading"
        role="status"
      />
    </main>
  )
}

export default Splash
