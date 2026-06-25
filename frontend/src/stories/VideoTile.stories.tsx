import type { Meta, StoryObj } from '@storybook/react'
import { VideoTile } from '../components/ui/VideoTile'

const meta: Meta<typeof VideoTile> = {
  title: 'Components/VideoTile',
  component: VideoTile,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'WebRTC video tile. Works with or without a live MediaStream. Shows avatar fallback when video is muted.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof VideoTile>

export const Default: Story = {
  args: {
    participantName: 'alex_dev',
    isAudioMuted: false,
    isVideoMuted: true,
    className: 'w-80',
  },
}

export const AudioMuted: Story = {
  args: {
    participantName: 'sarah_m',
    isAudioMuted: true,
    isVideoMuted: true,
    className: 'w-80',
  },
}

export const LocalTile: Story = {
  args: {
    participantName: 'You',
    isLocal: true,
    isAudioMuted: false,
    isVideoMuted: true,
    className: 'w-40',
  },
}

export const GridLayout: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-2 w-[600px]">
      <VideoTile participantName="You" isLocal isVideoMuted />
      <VideoTile participantName="alex_dev" isVideoMuted />
      <VideoTile participantName="sarah_m" isAudioMuted isVideoMuted />
      <VideoTile participantName="jk_codes" isVideoMuted />
    </div>
  ),
}
