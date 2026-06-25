import React, { useState } from 'react'
import { UserX } from 'lucide-react'
import { Heading } from '../components/ui/Heading'
import { Text } from '../components/ui/Text'
import { Button } from '../components/ui/Button'
import { Avatar, AvatarFallback } from '../components/ui/Avatar'
import { Card, CardContent } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'

interface BlockedUser {
  id: string
  username: string
  blockedOn: string
  initials: string
}

const initialBlockedUsers: BlockedUser[] = [
  { id: '1', username: 'troll_user99', blockedOn: 'Jun 10', initials: 'TU' },
  { id: '2', username: 'spam_bot',     blockedOn: 'Jun 10', initials: 'SB' },
  { id: '3', username: 'rude_person',  blockedOn: 'Jun 10', initials: 'RP' },
]

export function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(initialBlockedUsers)
  const [unblocking, setUnblocking] = useState<string | null>(null)

  const handleUnblock = (id: string) => {
    setUnblocking(id)
    setTimeout(() => {
      setBlockedUsers((prev) => prev.filter((u) => u.id !== id))
      setUnblocking(null)
    }, 600)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
      {/* Page header */}
      <div className="mb-6">
        <Heading variant="h3" className="text-text-primary mb-1">
          Blocked Users
        </Heading>
        <Text variant="caption">
          {blockedUsers.length > 0
            ? `${blockedUsers.length} blocked ${blockedUsers.length === 1 ? 'user' : 'users'}`
            : 'No blocked users'}
        </Text>
      </div>

      {/* Blocked user list */}
      {blockedUsers.length > 0 && (
        <ul className="space-y-3" aria-label="Blocked users list" role="list">
          {blockedUsers.map((user) => (
            <li key={user.id}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="text-sm font-semibold bg-surface-active text-text-secondary">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Text variant="label" className="text-text-primary truncate block">
                        {user.username}
                      </Text>
                      <Text variant="caption" className="text-text-tertiary">
                        Blocked on {user.blockedOn}
                      </Text>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnblock(user.id)}
                      isLoading={unblocking === user.id}
                      aria-label={`Unblock ${user.username}`}
                      className="shrink-0 text-text-secondary hover:text-text-primary"
                    >
                      Unblock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      <div
        className={
          blockedUsers.length > 0
            ? 'mt-6 opacity-40 pointer-events-none select-none'
            : 'mt-0'
        }
        aria-hidden={blockedUsers.length > 0}
      >
        <EmptyState
          icon={<UserX className="h-8 w-8" aria-hidden="true" />}
          title="No users blocked"
          description="Users you block will appear here. Blocking someone prevents them from matching or messaging you."
          className={blockedUsers.length > 0 ? 'min-h-[160px]' : 'min-h-[280px]'}
        />
      </div>
    </div>
  )
}
