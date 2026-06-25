import React from "react"
import { cn } from "../../lib/utils"
import { Card, CardContent } from "./Card"

import { Heading } from "./Heading"
import { Text } from "./Text"
import { Button } from "./Button"
import { Users, Lock, LockOpen } from "lucide-react"

interface RoomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  roomName: string
  participantCount: number
  maxParticipants: number
  isPrivate?: boolean
  topics?: string[]
  onJoin?: () => void
}

export function RoomCard({
  roomName,
  participantCount,
  maxParticipants,
  isPrivate,
  topics = [],
  onJoin,
  className,
  ...props
}: RoomCardProps) {
  const isFull = participantCount >= maxParticipants

  return (
    <Card className={cn("overflow-hidden transition-shadow hover:shadow-md", className)} {...props}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <Heading variant="h4" className="mb-1 flex items-center gap-2 text-text-primary">
              {isPrivate ? <Lock className="h-4 w-4 text-text-tertiary" /> : <LockOpen className="h-4 w-4 text-text-tertiary" />}
              {roomName}
            </Heading>
            <div className="flex items-center gap-2 text-text-secondary">
              <Users className="h-4 w-4" />
              <Text variant="caption">
                {participantCount} / {maxParticipants} participants
              </Text>
            </div>
          </div>
        </div>
        
        {topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map((topic, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-surface-active px-2.5 py-0.5 text-xs font-semibold text-text-primary"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end">
          <Button variant="primary" disabled={isFull} onClick={onJoin}>
            {isFull ? "Room Full" : "Join Room"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
