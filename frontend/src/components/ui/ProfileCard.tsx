import React from "react"
import { cn } from "../../lib/utils"
import { Card, CardContent } from "./Card"
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar"
import { Heading } from "./Heading"
import { Text } from "./Text"
import { Badge } from "./Badge"
import { Button } from "./Button"
import { MessageSquare, UserPlus } from "lucide-react"

interface ProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  username: string
  avatarUrl?: string
  bio?: string
  tags?: string[]
  matchPercentage?: number
  onConnect?: () => void
  onMessage?: () => void
}

export function ProfileCard({
  username,
  avatarUrl,
  bio,
  tags = [],
  matchPercentage,
  onConnect,
  onMessage,
  className,
  ...props
}: ProfileCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-shadow hover:shadow-md", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="mb-4 h-24 w-24 border-2 border-surface-active">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-3xl">{username[0]}</AvatarFallback>
          </Avatar>
          
          <Heading variant="h3" className="mb-1 text-text-primary">
            {username}
          </Heading>
          
          {matchPercentage !== undefined && (
            <Badge variant="secondary" className="mb-4 text-brand-primary">
              {matchPercentage}% Match
            </Badge>
          )}

          {bio && (
            <Text variant="body" className="mb-6 line-clamp-3 text-text-secondary">
              {bio}
            </Text>
          )}

          {tags.length > 0 && (
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full bg-surface-active px-2.5 py-0.5 text-xs font-semibold text-text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex w-full gap-3">
            <Button variant="secondary" className="flex-1" onClick={onMessage}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
            <Button variant="primary" className="flex-1" onClick={onConnect}>
              <UserPlus className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
