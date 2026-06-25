import React from 'react'
import {
  Pencil,
  MapPin,
  Languages,
  Star,
  CalendarDays,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Divider } from '../components/ui/Divider'
import { Heading } from '../components/ui/Heading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { Text } from '../components/ui/Text'

// ─── Static Data ──────────────────────────────────────────────────────────────

const INTERESTS = [
  'Gaming',
  'Music',
  'Tech',
  'Art',
  'Coffee',
  'Reading',
  'Travel',
  'Film',
  'Design',
  'Photography',
  'Fitness',
  'Cooking',
]

const REVIEWS = [
  {
    id: 1,
    username: 'sophia_w',
    displayName: 'Sophia Williams',
    initials: 'SW',
    rating: 5,
    text: "Alex is an amazing conversation partner! Super knowledgeable about tech and genuinely funny. Had such a great time in our room — would love to match again.",
    date: 'June 18, 2026',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
  },
  {
    id: 2,
    username: 'marcus_dev',
    displayName: 'Marcus Lee',
    initials: 'ML',
    rating: 5,
    text: "Great energy, super easy to talk to. We ended up in a 2-hour deep-dive about open source tooling. Highly recommend matching with Alex if you're into that space.",
    date: 'June 10, 2026',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 3,
    username: 'priya_k',
    displayName: 'Priya Kumar',
    initials: 'PK',
    rating: 4,
    text: "Really pleasant and thoughtful. The conversation flowed naturally and Alex was genuinely curious about my work. Would rate 5 stars but we got disconnected once!",
    date: 'May 29, 2026',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? 'fill-warning-bg text-warning-text'
              : 'fill-surface-active text-border-default'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

// ─── About Tab ────────────────────────────────────────────────────────────────

function AboutTab() {
  return (
    <div className="space-y-4" role="tabpanel" aria-label="About Alex Johnson">
      <Card>
        <CardHeader className="pb-3">
          <Heading variant="h4" className="text-text-primary">
            Bio
          </Heading>
        </CardHeader>
        <CardContent>
          <Text variant="body" className="text-text-secondary leading-relaxed">
            Full-stack developer by day, amateur DJ by night. I love building tools that bring people
            together and obsessing over clean code architecture. Always down to talk about React,
            distributed systems, or the perfect pour-over coffee technique. Let's geek out.
          </Text>
        </CardContent>

        <Divider className="mx-6" />

        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-surface-active flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-text-secondary" aria-hidden="true" />
            </div>
            <div>
              <Text variant="label" className="text-text-tertiary">
                Location
              </Text>
              <Text variant="body" className="text-text-primary font-medium">
                🌍 San Francisco, CA
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-surface-active flex items-center justify-center shrink-0">
              <Languages className="h-4 w-4 text-text-secondary" aria-hidden="true" />
            </div>
            <div>
              <Text variant="label" className="text-text-tertiary">
                Languages
              </Text>
              <Text variant="body" className="text-text-primary font-medium">
                English, Spanish
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-surface-active flex items-center justify-center shrink-0">
              <CalendarDays className="h-4 w-4 text-text-secondary" aria-hidden="true" />
            </div>
            <div>
              <Text variant="label" className="text-text-tertiary">
                Member since
              </Text>
              <Text variant="body" className="text-text-primary font-medium">
                January 2025
              </Text>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Interests Tab ────────────────────────────────────────────────────────────

function InterestsTab() {
  return (
    <div role="tabpanel" aria-label="Alex Johnson interests">
      <Card>
        <CardHeader className="pb-3">
          <Heading variant="h4" className="text-text-primary">
            Interests
          </Heading>
          <Text variant="caption">Topics Alex loves to talk about</Text>
        </CardHeader>
        <CardContent>
          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-label="Interest tags"
          >
            {INTERESTS.map((interest) => (
              <div key={interest} role="listitem">
                <Badge
                  variant="secondary"
                  className="px-3 py-1 text-sm cursor-default select-none"
                >
                  {interest}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

function ReviewsTab() {
  return (
    <div
      className="space-y-4"
      role="tabpanel"
      aria-label="Reviews for Alex Johnson"
    >
      {REVIEWS.map((review) => (
        <Card key={review.id} className="transition-shadow hover:shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage
                    src={review.avatarUrl}
                    alt={`${review.displayName} avatar`}
                  />
                  <AvatarFallback>{review.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <Text
                    variant="label"
                    className="text-text-primary font-semibold"
                  >
                    {review.displayName}
                  </Text>
                  <Text variant="caption" className="text-text-tertiary">
                    @{review.username}
                  </Text>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <StarRating rating={review.rating} />
                <Text variant="caption" className="text-text-tertiary">
                  {review.date}
                </Text>
              </div>
            </div>

            <Divider className="mb-3" />

            <Text variant="body" className="text-text-secondary leading-relaxed">
              "{review.text}"
            </Text>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export function Profile() {
  return (
    <div className="min-h-screen bg-canvas" aria-label="Profile page">
      {/* Header */}
      <header
        className="w-full bg-surface border-b border-border-default"
        aria-label="Alex Johnson profile header"
      >
        <div
          className="h-32 sm:h-40 w-full bg-gradient-to-br from-brand-primary/30 via-brand-primary/10 to-surface-active"
          aria-hidden="true"
        />

        <div className="px-4 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <Avatar
                className="h-20 w-20 border-4 border-surface shadow-lg"
                aria-label="Alex Johnson profile picture"
              >
                <AvatarImage
                  src="https://i.pravatar.cc/150?img=8"
                  alt="Alex Johnson"
                />
                <AvatarFallback className="text-2xl">AJ</AvatarFallback>
              </Avatar>

              <div className="space-y-0.5 pb-1">
                <Heading variant="h2" className="text-text-primary leading-none">
                  Alex Johnson
                </Heading>
                <Text variant="caption" className="text-brand-primary font-medium">
                  @alex_dev
                </Text>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              aria-label="Edit your profile"
              className="sm:mb-1 w-fit"
            >
              <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
              Edit Profile
            </Button>
          </div>

          <div
            className="mt-5 flex flex-wrap gap-2"
            role="list"
            aria-label="Profile statistics"
          >
            {[
              { value: '127', label: 'Matches' },
              { value: '23', label: 'Rooms' },
              { value: '4.8★', label: 'Rating' },
            ].map(({ value, label }) => (
              <div
                key={label}
                role="listitem"
                className="flex flex-col items-center justify-center px-5 py-2.5 rounded-xl bg-surface-hover border border-border-default min-w-[88px]"
                aria-label={`${value} ${label}`}
              >
                <span className="text-base font-bold text-text-primary leading-none">
                  {value}
                </span>
                <Text variant="caption" className="text-text-tertiary mt-0.5">
                  {label}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-6">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full mb-6" aria-label="Profile sections">
            <TabsTrigger value="about" className="flex-1">
              About
            </TabsTrigger>
            <TabsTrigger value="interests" className="flex-1">
              Interests
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <AboutTab />
          </TabsContent>

          <TabsContent value="interests">
            <InterestsTab />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}