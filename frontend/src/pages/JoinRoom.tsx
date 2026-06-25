import React, { useState } from "react"
import { Heading } from "../components/ui/Heading"
import { Text } from "../components/ui/Text"
import { SearchInput } from "../components/ui/SearchInput"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/Tabs"
import { RoomCard } from "../components/ui/RoomCard"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/Pagination"

// ── static room data ──────────────────────────────────────────────────────────
const ALL_ROOMS = [
  {
    id: "1",
    roomName: "Gaming Talk",
    participantCount: 5,
    maxParticipants: 6,
    isPrivate: false,
    topics: ["Gaming", "FPS"],
    tab: "public",
  },
  {
    id: "2",
    roomName: "Tech Discussion",
    participantCount: 2,
    maxParticipants: 4,
    isPrivate: false,
    topics: ["Programming", "AI"],
    tab: "public",
  },
  {
    id: "3",
    roomName: "Chill Music",
    participantCount: 3,
    maxParticipants: 6,
    isPrivate: true,
    topics: ["Music", "Chill"],
    tab: "invite",
  },
  {
    id: "4",
    roomName: "Art & Design",
    participantCount: 1,
    maxParticipants: 4,
    isPrivate: false,
    topics: ["Design", "Art"],
    tab: "public",
  },
] as const

type TabValue = "all" | "public" | "invite"

// ── component ─────────────────────────────────────────────────────────────────
export default function JoinRoom() {
  const [search, setSearch]       = useState("")
  const [activeTab, setActiveTab] = useState<TabValue>("all")
  const [currentPage, setPage]    = useState(1)

  const filtered = ALL_ROOMS.filter((room) => {
    const matchesTab =
      activeTab === "all" || room.tab === activeTab
    const matchesSearch =
      search.trim() === "" ||
      room.roomName.toLowerCase().includes(search.toLowerCase()) ||
      room.topics.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    return matchesTab && matchesSearch
  })

  return (
    <div className="px-4 py-8 md:px-8">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-1">
        <Heading variant="h3" className="text-text-primary">
          Join a Room
        </Heading>
        <Text variant="body" className="text-text-secondary">
          Discover active rooms and jump right in.
        </Text>
      </div>

      {/* Search */}
      <div className="mb-5 max-w-lg">
        <SearchInput
          placeholder="Search rooms by name or topic..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          aria-label="Search rooms"
        />
      </div>

      {/* Filter tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => { setActiveTab(v as TabValue); setPage(1) }}
        className="mb-6"
      >
        <TabsList aria-label="Filter rooms by type">
          <TabsTrigger value="all">All Rooms</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
          <TabsTrigger value="invite">By Invite</TabsTrigger>
        </TabsList>

        {/* We render the grid inside TabsContent so the tab panel is correct for a11y */}
        {(["all", "public", "invite"] as TabValue[]).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            {filtered.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-surface py-16 text-center">
                <Text variant="body-lg" className="text-text-secondary">
                  No rooms found
                </Text>
                <Text variant="caption" className="mt-1 text-text-tertiary">
                  Try a different search term or filter.
                </Text>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                {filtered.map((room) => (
                  <RoomCard
                    key={room.id}
                    roomName={room.roomName}
                    participantCount={room.participantCount}
                    maxParticipants={room.maxParticipants}
                    isPrivate={room.isPrivate}
                    topics={[...room.topics]}
                    onJoin={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="mt-8">
          <Pagination aria-label="Room list pagination">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
                />
              </PaginationItem>

              {[1, 2, 3].map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setPage(page)}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(3, p + 1))}
                  aria-disabled={currentPage === 3}
                  className={currentPage === 3 ? "pointer-events-none opacity-40" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
