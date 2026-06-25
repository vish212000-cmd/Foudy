import React, { useState } from "react"
import { cn } from "../lib/utils"
import { Heading } from "../components/ui/Heading"
import { Text } from "../components/ui/Text"
import { TextInput } from "../components/ui/TextInput"
import { Textarea } from "../components/ui/Textarea"
import { RadioGroup, RadioGroupItem } from "../components/ui/RadioGroup"
import { Switch } from "../components/ui/Switch"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { Divider } from "../components/ui/Divider"

// ── static data ──────────────────────────────────────────────────────────────
const ROOM_TYPES = [
  { value: "public",  label: "Public",      description: "Anyone can join" },
  { value: "invite",  label: "Invite Only", description: "Invite people by link" },
  { value: "private", label: "Private",     description: "Password protected" },
] as const

const TOPICS = ["Gaming", "Music", "Tech", "Art", "Sports", "Film"] as const
const DEFAULT_SELECTED = new Set<string>(["Gaming", "Tech", "Sports"])

// ── component ─────────────────────────────────────────────────────────────────
export default function CreateRoom() {
  const [roomType, setRoomType]         = useState<string>("public")
  const [selectedTopics, setSelected]   = useState<Set<string>>(DEFAULT_SELECTED)
  const [videoEnabled, setVideo]        = useState(true)
  const [audioEnabled, setAudio]        = useState(true)

  function toggleTopic(topic: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(topic) ? next.delete(topic) : next.add(topic)
      return next
    })
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Heading variant="h3" className="mb-6 text-text-primary">
        Create a Room
      </Heading>

      <Card>
        <CardContent className="pt-6">
          <form
            aria-label="Create room form"
            onSubmit={(e) => e.preventDefault()}
            noValidate
          >
            <div className="space-y-5">

              {/* Room Name */}
              <TextInput
                id="room-name"
                label="Room Name"
                placeholder="e.g. Gaming Talk"
                autoComplete="off"
                aria-required="true"
              />

              {/* Description */}
              <Textarea
                id="room-desc"
                label="Description (optional)"
                placeholder="What will you discuss?"
                rows={3}
              />

              <Divider />

              {/* Room Type */}
              <fieldset>
                <legend className="mb-3">
                  <Text variant="label" className="text-text-primary">
                    Room Type
                  </Text>
                </legend>
                <RadioGroup
                  value={roomType}
                  onValueChange={setRoomType}
                  aria-label="Room type"
                  className="gap-3"
                >
                  {ROOM_TYPES.map(({ value, label, description }) => (
                    <label
                      key={value}
                      htmlFor={`room-type-${value}`}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all",
                        roomType === value
                          ? "border-brand-primary bg-brand-primary/5"
                          : "border-border-default bg-surface hover:border-border-strong hover:bg-surface-hover"
                      )}
                    >
                      <RadioGroupItem
                        id={`room-type-${value}`}
                        value={value}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex flex-col gap-0.5">
                        <Text variant="label" className="text-text-primary">
                          {label}
                        </Text>
                        <Text variant="caption" className="text-text-secondary">
                          {description}
                        </Text>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </fieldset>

              <Divider />

              {/* Max Participants */}
              <div>
                <TextInput
                  id="max-participants"
                  label="Max Participants"
                  type="number"
                  placeholder="6"
                  min={2}
                  max={6}
                  aria-describedby="max-participants-hint"
                />
                <Text
                  id="max-participants-hint"
                  variant="caption"
                  className="mt-1.5 text-text-secondary"
                >
                  Maximum 6 participants
                </Text>
              </div>

              <Divider />

              {/* Topics */}
              <div>
                <Text variant="label" className="mb-3 block text-text-primary">
                  Topics / Interests
                </Text>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Select topics">
                  {TOPICS.map((topic) => {
                    const isActive = selectedTopics.has(topic)
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        aria-pressed={isActive}
                        aria-label={`${isActive ? "Deselect" : "Select"} topic: ${topic}`}
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                          isActive
                            ? "border-transparent bg-brand-primary text-text-inverse hover:bg-brand-hover"
                            : "border-border-default bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary"
                        )}
                      >
                        {topic}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Divider />

              {/* Media Settings */}
              <div className="space-y-4">
                <Text variant="label" className="block text-text-primary">
                  Media Settings
                </Text>

                <div className="flex items-center justify-between rounded-lg border border-border-default bg-surface p-4">
                  <div className="flex flex-col gap-0.5">
                    <Text variant="label" className="text-text-primary">Enable Video</Text>
                    <Text variant="caption" className="text-text-secondary">
                      Allow participants to share their camera
                    </Text>
                  </div>
                  <Switch
                    id="enable-video"
                    checked={videoEnabled}
                    onCheckedChange={setVideo}
                    aria-label="Enable video"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border-default bg-surface p-4">
                  <div className="flex flex-col gap-0.5">
                    <Text variant="label" className="text-text-primary">Enable Audio</Text>
                    <Text variant="caption" className="text-text-secondary">
                      Allow participants to use their microphone
                    </Text>
                  </div>
                  <Switch
                    id="enable-audio"
                    checked={audioEnabled}
                    onCheckedChange={setAudio}
                    aria-label="Enable audio"
                  />
                </div>
              </div>

              <Divider />

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <Button type="button" variant="ghost" aria-label="Cancel and go back">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" aria-label="Create room">
                  Create Room
                </Button>
              </div>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
