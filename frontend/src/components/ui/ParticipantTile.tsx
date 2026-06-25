// ParticipantTile is just an alias for VideoTile given FOUDY's WebRTC spec right now
import { VideoTile } from './VideoTile'

export function ParticipantTile(props: React.ComponentProps<typeof VideoTile>) {
  return <VideoTile {...props} />
}
