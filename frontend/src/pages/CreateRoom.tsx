import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
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
import { roomService } from "../services/RoomService"

// ── static data ──────────────────────────────────────────────────────────────
const ROOM_TYPES = [
  { value: "public",  label: "Public",      description: "Anyone can join" },
  { value: "invite",  label: "Invite Only", description: "Invite people by link" },
  { value: "private", label: "Private",     description: "Password protected" },
] as const

const TOPICS = ["Gaming", "Music", "Tech", "Art", "Sports", "Film"] as const
const DEFAULT_SELECTED = new Set<string>(["Gaming", "Tech", "Sports"])

const createRoomSchema = z.object({
  roomName: z.string().min(3, 'Room name must be at least 3 characters').max(60, 'Room name is too long'),
  description: z.string().max(200, 'Description is too long').optional(),
  roomType: z.enum(["public", "invite", "private"]),
  maxParticipants: z.number().min(2, 'At least 2 participants').max(6, 'At most 6 participants'),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  videoEnabled: z.boolean(),
  audioEnabled: z.boolean()
})

type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

// ── component ─────────────────────────────────────────────────────────────────
export default function CreateRoom() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      roomName: '',
      description: '',
      roomType: 'public',
      maxParticipants: 6,
      topics: Array.from(DEFAULT_SELECTED),
      videoEnabled: true,
      audioEnabled: true
    }
  });

  const selectedTopics = watch("topics");

  function toggleTopic(topic: string) {
    const next = new Set(selectedTopics);
    if (next.has(topic)) {
      next.delete(topic);
    } else {
      next.add(topic);
    }
    setValue("topics", Array.from(next), { shouldValidate: true });
  }

  const onSubmit = async (data: CreateRoomFormValues) => {
    setApiError(null);
    try {
      const room = await roomService.createRoom(data.maxParticipants, {
        name: data.roomName,
        description: data.description,
        type: data.roomType,
        topics: data.topics,
        videoEnabled: data.videoEnabled,
        audioEnabled: data.audioEnabled
      });
      // Redirect to newly created room
      navigate(`/room/${room.id}`);
    } catch (error: any) {
      setApiError(error.response?.data?.error || "Failed to create room.");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Heading variant="h3" className="mb-6 text-text-primary">
        Create a Room
      </Heading>

      <Card>
        <CardContent className="pt-6">
          <form
            aria-label="Create room form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {apiError && (
              <div className="mb-6 p-3 bg-danger-bg/20 text-danger-text text-sm rounded-lg">
                {apiError}
              </div>
            )}
            
            <div className="space-y-5">
              {/* Room Name */}
              <TextInput
                id="room-name"
                label="Room Name"
                placeholder="e.g. Gaming Talk"
                autoComplete="off"
                aria-invalid={!!errors.roomName}
                error={errors.roomName?.message}
                disabled={isSubmitting}
                {...register("roomName")}
              />

              {/* Description */}
              <Textarea
                id="room-desc"
                label="Description (optional)"
                placeholder="What will you discuss?"
                rows={3}
                aria-invalid={!!errors.description}
                error={errors.description?.message}
                disabled={isSubmitting}
                {...register("description")}
              />

              <Divider />

              {/* Room Type */}
              <fieldset>
                <legend className="mb-3">
                  <Text variant="label" className="text-text-primary">
                    Room Type
                  </Text>
                </legend>
                <Controller
                  control={control}
                  name="roomType"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-label="Room type"
                      className="gap-3"
                    >
                      {ROOM_TYPES.map(({ value, label, description }) => (
                        <label
                          key={value}
                          htmlFor={`room-type-${value}`}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all",
                            field.value === value
                              ? "border-brand-primary bg-brand-primary/5"
                              : "border-border-default bg-surface hover:border-border-strong hover:bg-surface-hover",
                            isSubmitting && "opacity-50 pointer-events-none"
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
                  )}
                />
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
                  aria-invalid={!!errors.maxParticipants}
                  error={errors.maxParticipants?.message}
                  disabled={isSubmitting}
                  {...register("maxParticipants", { valueAsNumber: true })}
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
                    const isActive = selectedTopics.includes(topic)
                    return (
                      <Button
                        key={topic}
                        type="button"
                        variant={isActive ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => toggleTopic(topic)}
                        aria-pressed={isActive}
                        aria-label={`${isActive ? "Deselect" : "Select"} topic: ${topic}`}
                        className="rounded-full"
                        disabled={isSubmitting}
                      >
                        {topic}
                      </Button>
                    )
                  })}
                </div>
                {errors.topics && (
                  <Text variant="caption" className="text-danger-text mt-2 block">
                    {errors.topics.message}
                  </Text>
                )}
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
                  <Controller
                    control={control}
                    name="videoEnabled"
                    render={({ field }) => (
                      <Switch
                        id="enable-video"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Enable video"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border-default bg-surface p-4">
                  <div className="flex flex-col gap-0.5">
                    <Text variant="label" className="text-text-primary">Enable Audio</Text>
                    <Text variant="caption" className="text-text-secondary">
                      Allow participants to use their microphone
                    </Text>
                  </div>
                  <Controller
                    control={control}
                    name="audioEnabled"
                    render={({ field }) => (
                      <Switch
                        id="enable-audio"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Enable audio"
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              </div>

              <Divider />

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <Button 
                  type="button" 
                  variant="ghost" 
                  aria-label="Cancel and go back"
                  disabled={isSubmitting}
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  aria-label="Create room"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Room"}
                </Button>
              </div>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
