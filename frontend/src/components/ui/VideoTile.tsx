import React from "react"
import { cn } from "../../lib/utils"
import { Text } from "./Text"
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar"
import { MicOff } from "lucide-react"

interface VideoTileProps extends React.HTMLAttributes<HTMLDivElement> {
  stream?: MediaStream
  participantName: string
  avatarUrl?: string
  isAudioMuted?: boolean
  isVideoMuted?: boolean
  isLocal?: boolean
}

export const VideoTile = React.forwardRef<HTMLDivElement, VideoTileProps>(
  ({ className, stream, participantName, avatarUrl, isAudioMuted, isVideoMuted, isLocal, ...props }, ref) => {
    const videoRef = React.useRef<HTMLVideoElement>(null)

    React.useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream
      }
    }, [stream])

    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-border-default bg-surface-active shadow-sm",
          className
        )}
        {...props}
      >
        {(!stream || isVideoMuted) ? (
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-2xl">{participantName[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-md bg-black/60 px-2 py-1 backdrop-blur-md">
            <Text variant="caption" className="text-white font-medium">
              {participantName} {isLocal && "(You)"}
            </Text>
          </div>
          {isAudioMuted && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-danger-bg/80 text-danger-text backdrop-blur-md">
              <MicOff className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    )
  }
)
VideoTile.displayName = "VideoTile"
