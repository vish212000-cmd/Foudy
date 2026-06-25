import React, { useState } from "react"
import {
  Radio,
  MessageSquare,
  Users,
  Bell,
  RefreshCw,
  Search,
  PlusCircle,
} from "lucide-react"
import { Heading } from "../components/ui/Heading"
import { Text } from "../components/ui/Text"
import { Button } from "../components/ui/Button"
import { EmptyState } from "../components/ui/EmptyState"
import { ErrorState } from "../components/ui/ErrorState"
import { Divider } from "../components/ui/Divider"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Text
        variant="label"
        className="text-text-tertiary uppercase tracking-widest text-xs"
        as="span"
      >
        {children}
      </Text>
      <Divider className="flex-1" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export function EmptyStatePage() {
  const [retrying, setRetrying] = useState(false)
  const [findingMatch, setFindingMatch] = useState(false)

  const handleRetry = () => {
    setRetrying(true)
    setTimeout(() => setRetrying(false), 1500)
  }

  const handleFindMatch = () => {
    setFindingMatch(true)
    setTimeout(() => setFindingMatch(false), 1500)
  }

  return (
    <main
      className="min-h-screen bg-canvas py-12"
      aria-label="Empty states design system showcase"
      role="main"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ----------------------------------------------------------------
            Page header
        ---------------------------------------------------------------- */}
        <header className="mb-12">
          <Heading variant="h2" className="text-text-primary mb-2">
            Empty States
          </Heading>
          <Text variant="bodyLg" className="text-text-secondary max-w-2xl">
            Design system showcase &mdash; all possible empty and error states
            used across the FOUDY app.
          </Text>
        </header>

        {/* ----------------------------------------------------------------
            Social / Discovery states
        ---------------------------------------------------------------- */}
        <section aria-labelledby="section-social" className="mb-12">
          <SectionLabel>
            <span id="section-social">Social &amp; Discovery</span>
          </SectionLabel>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* No Matches */}
            <EmptyState
              aria-label="No matches found empty state"
              icon={
                <Radio
                  className="h-8 w-8 text-text-tertiary"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
              }
              title="No Matches Yet"
              description="Start matching to meet new people who share your interests."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleFindMatch}
                  isLoading={findingMatch}
                  aria-label="Find a match"
                  className="gap-2"
                >
                  {!findingMatch && (
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {findingMatch ? "Searching\u2026" : "Find a Match"}
                </Button>
              }
            />

            {/* No Messages */}
            <EmptyState
              aria-label="No messages empty state"
              icon={
                <MessageSquare
                  className="h-8 w-8 text-text-tertiary"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
              }
              title="No Messages"
              description="Your conversations will appear here once you start chatting."
            />
          </div>
        </section>

        {/* ----------------------------------------------------------------
            Rooms & Notifications states
        ---------------------------------------------------------------- */}
        <section aria-labelledby="section-rooms" className="mb-12">
          <SectionLabel>
            <span id="section-rooms">Rooms &amp; Notifications</span>
          </SectionLabel>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* No Rooms */}
            <EmptyState
              aria-label="No rooms empty state"
              icon={
                <Users
                  className="h-8 w-8 text-text-tertiary"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
              }
              title="No Rooms"
              description="Create or join a room to get started. Rooms let you connect with multiple people at once."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  aria-label="Browse available rooms"
                  className="gap-2"
                  onClick={() => {
                    /* static */
                  }}
                >
                  <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  Browse Rooms
                </Button>
              }
            />

            {/* No Notifications */}
            <EmptyState
              aria-label="No notifications empty state"
              icon={
                <Bell
                  className="h-8 w-8 text-text-tertiary"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
              }
              title="No Notifications"
              description="You&rsquo;re all caught up! We'll notify you when something needs your attention."
            />
          </div>
        </section>

        {/* ----------------------------------------------------------------
            Error states
        ---------------------------------------------------------------- */}
        <section aria-labelledby="section-errors">
          <SectionLabel>
            <span id="section-errors">Error States</span>
          </SectionLabel>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Generic error */}
            <ErrorState
              aria-label="Failed to load error state"
              title="Failed to Load"
              description="We couldn\u2019t fetch this content. Please check your connection and try again."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRetry}
                  isLoading={retrying}
                  aria-label="Retry loading content"
                  className="gap-2"
                >
                  {!retrying && (
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {retrying ? "Retrying\u2026" : "Retry"}
                </Button>
              }
            />

            {/* Placeholder to complete the grid symmetrically */}
            <div
              className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface p-8 text-center"
              aria-label="Custom error state placeholder"
            >
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-active"
                aria-hidden="true"
              >
                <span className="text-2xl select-none" role="img" aria-label="Sparkles">✨</span>
              </div>
              <Heading variant="h4" className="mb-2 text-text-primary">
                More Coming Soon
              </Heading>
              <Text variant="body" className="text-text-secondary max-w-xs">
                Additional error and empty state variants will appear here as the design system grows.
              </Text>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default EmptyStatePage
